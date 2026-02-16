"""Sandbox abstraction layer for code execution."""

from abc import ABC, abstractmethod
from typing import Tuple, List, Optional, Dict, Any
import asyncio
import os


class BaseSandbox(ABC):
    """Base class for sandbox implementations."""

    @abstractmethod
    async def execute_bash(self, command: str) -> Tuple[str, str, int]:
        """Execute a bash command. Returns (stdout, stderr, exit_code)."""
        pass

    @abstractmethod
    async def write_file(self, path: str, content: str) -> bool:
        """Write content to a file. Returns success status."""
        pass

    @abstractmethod
    async def read_file(self, path: str) -> str:
        """Read file contents. Returns content as string."""
        pass

    @abstractmethod
    async def list_files(self, directory: str = ".") -> List[str]:
        """List files in a directory."""
        pass

    @abstractmethod
    async def upload_file(self, name: str, content: bytes) -> str:
        """Upload a file to the sandbox. Returns the path."""
        pass

    @abstractmethod
    async def download_file(self, path: str) -> bytes:
        """Download a file from the sandbox. Returns content as bytes."""
        pass

    @abstractmethod
    async def destroy(self) -> None:
        """Clean up and destroy the sandbox."""
        pass

    @abstractmethod
    async def copy_directory(self, local_path: str, sandbox_path: str, ignore_patterns: List[str]) -> bool:
        """Copy entire directory to sandbox. Returns success status."""
        pass

    @abstractmethod
    async def list_directory_recursive(self, path: str) -> List[Dict[str, Any]]:
        """List all files recursively. Returns list of {path, type, size}."""
        pass

    @abstractmethod
    async def get_file_hash(self, path: str) -> str:
        """Get file hash for change detection."""
        pass


class E2BSandbox(BaseSandbox):
    """E2B cloud sandbox implementation."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.sandbox = None

    async def __aenter__(self):
        """Async context manager entry."""
        from e2b_code_interpreter import AsyncSandbox

        self.sandbox = await AsyncSandbox.create(api_key=self.api_key)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.destroy()

    async def execute_bash(self, command: str) -> Tuple[str, str, int]:
        """Execute bash command in E2B sandbox."""
        if not self.sandbox:
            raise RuntimeError("Sandbox not initialized")

        # Wrap command to run in /workspace/ directory (if not already prefixed with cd)
        if not command.strip().startswith("cd "):
            command = f"cd /workspace && {command}"

        # Run bash command using run_code with bash language
        result = await self.sandbox.run_code(command, language="bash")

        # Collect stdout from results
        stdout_parts = []
        stderr_parts = []

        for output in result.logs.stdout:
            stdout_parts.append(output)

        for output in result.logs.stderr:
            stderr_parts.append(output)

        stdout = "".join(stdout_parts)
        stderr = "".join(stderr_parts)
        exit_code = 1 if result.error else 0

        return stdout, stderr, exit_code

    async def write_file(self, path: str, content: str) -> bool:
        """Write file in E2B sandbox."""
        if not self.sandbox:
            raise RuntimeError("Sandbox not initialized")

        try:
            await self.sandbox.files.write(path, content)
            return True
        except Exception as e:
            print(f"Error writing file: {e}")
            return False

    async def read_file(self, path: str) -> str:
        """Read file from E2B sandbox."""
        if not self.sandbox:
            raise RuntimeError("Sandbox not initialized")

        content = await self.sandbox.files.read(path)
        return content

    async def list_files(self, directory: str = ".") -> List[str]:
        """List files in E2B sandbox."""
        if not self.sandbox:
            raise RuntimeError("Sandbox not initialized")

        stdout, _, _ = await self.execute_bash(f"ls -1 {directory}")
        return [f.strip() for f in stdout.split('\n') if f.strip()]

    async def upload_file(self, name: str, content: bytes) -> str:
        """Upload file to E2B sandbox."""
        path = f"/tmp/{name}"
        await self.write_file(path, content.decode('utf-8'))
        return path

    async def download_file(self, path: str) -> bytes:
        """Download file from E2B sandbox."""
        content = await self.read_file(path)
        return content.encode('utf-8')

    async def destroy(self) -> None:
        """Destroy E2B sandbox."""
        if self.sandbox:
            await self.sandbox.kill()
            self.sandbox = None

    async def copy_directory(self, local_path: str, sandbox_path: str, ignore_patterns: List[str]) -> bool:
        """Copy entire directory to E2B sandbox."""
        if not self.sandbox:
            raise RuntimeError("Sandbox not initialized")

        from pathlib import Path
        from core.project_utils import should_ignore

        local = Path(local_path)

        # Walk the directory and upload files
        for root, dirs, files in os.walk(local):
            # Filter ignored directories
            dirs[:] = [d for d in dirs if not should_ignore(d, ignore_patterns)]

            for file in files:
                if should_ignore(file, ignore_patterns):
                    continue

                file_path = Path(root) / file
                # Get relative path from local root
                rel_path = file_path.relative_to(local)
                # Construct sandbox path
                dest_path = f"{sandbox_path}/{rel_path}"

                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                    await self.sandbox.files.write(dest_path, content)
                except Exception as e:
                    print(f"Warning: Failed to copy {rel_path}: {e}")
                    continue

        return True

    async def list_directory_recursive(self, path: str) -> List[Dict[str, Any]]:
        """List all files recursively in E2B sandbox."""
        if not self.sandbox:
            raise RuntimeError("Sandbox not initialized")

        # Use find command to list all files
        stdout, _, _ = await self.execute_bash(
            f"find {path} -type f -o -type d | head -1000"
        )

        files = []
        for line in stdout.split('\n'):
            line = line.strip()
            if not line or line == path:
                continue

            # Determine type
            is_file_stdout, _, is_file_code = await self.execute_bash(f"test -f {line} && echo 'file' || echo 'dir'")
            file_type = 'file' if 'file' in is_file_stdout else 'directory'

            # Get size if it's a file
            size = None
            if file_type == 'file':
                size_stdout, _, _ = await self.execute_bash(f"stat -f%z {line} 2>/dev/null || stat -c%s {line} 2>/dev/null")
                try:
                    size = int(size_stdout.strip())
                except:
                    pass

            files.append({
                'path': line,
                'type': file_type,
                'size': size
            })

        return files

    async def get_file_hash(self, path: str) -> str:
        """Get SHA256 hash of file in E2B sandbox."""
        if not self.sandbox:
            raise RuntimeError("Sandbox not initialized")

        stdout, _, code = await self.execute_bash(f"sha256sum {path} 2>/dev/null || shasum -a 256 {path}")
        if code == 0 and stdout:
            # sha256sum outputs: hash filename
            return stdout.split()[0]
        return ""


class DockerSandbox(BaseSandbox):
    """Local Docker sandbox implementation."""

    def __init__(self, image: str = "python:3.11-slim"):
        self.image = image
        self.container = None
        self.client = None

    async def __aenter__(self):
        """Async context manager entry."""
        import docker

        self.client = docker.from_env()
        # Run container in detached mode
        self.container = self.client.containers.run(
            self.image,
            command="sleep infinity",
            detach=True,
            remove=True,
            working_dir="/workspace"
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.destroy()

    async def execute_bash(self, command: str) -> Tuple[str, str, int]:
        """Execute bash command in Docker container."""
        if not self.container:
            raise RuntimeError("Container not initialized")

        # Run in thread pool since docker-py is blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.container.exec_run(
                f'/bin/bash -c "{command}"',
                workdir="/workspace"
            )
        )

        exit_code = result.exit_code
        output = result.output.decode('utf-8')

        # Split stdout/stderr (simplified - docker combines them)
        if exit_code == 0:
            return output, "", exit_code
        else:
            return "", output, exit_code

    async def write_file(self, path: str, content: str) -> bool:
        """Write file to Docker container."""
        if not self.container:
            raise RuntimeError("Container not initialized")

        try:
            import tarfile
            import io

            # Create tar archive with file
            tar_stream = io.BytesIO()
            tar = tarfile.open(fileobj=tar_stream, mode='w')

            file_data = content.encode('utf-8')
            tarinfo = tarfile.TarInfo(name=os.path.basename(path))
            tarinfo.size = len(file_data)
            tar.addfile(tarinfo, io.BytesIO(file_data))
            tar.close()

            tar_stream.seek(0)

            # Upload to container
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.container.put_archive(
                    os.path.dirname(path) or "/workspace",
                    tar_stream.getvalue()
                )
            )
            return True
        except Exception as e:
            print(f"Error writing file: {e}")
            return False

    async def read_file(self, path: str) -> str:
        """Read file from Docker container."""
        stdout, stderr, code = await self.execute_bash(f"cat {path}")
        if code != 0:
            raise FileNotFoundError(f"File not found: {path}")
        return stdout

    async def list_files(self, directory: str = ".") -> List[str]:
        """List files in Docker container."""
        stdout, _, _ = await self.execute_bash(f"ls -1 {directory}")
        return [f.strip() for f in stdout.split('\n') if f.strip()]

    async def upload_file(self, name: str, content: bytes) -> str:
        """Upload file to Docker container."""
        path = f"/workspace/{name}"
        await self.write_file(path, content.decode('utf-8'))
        return path

    async def download_file(self, path: str) -> bytes:
        """Download file from Docker container."""
        content = await self.read_file(path)
        return content.encode('utf-8')

    async def destroy(self) -> None:
        """Destroy Docker container."""
        if self.container:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self.container.stop)
            self.container = None
        if self.client:
            self.client.close()
            self.client = None

    async def copy_directory(self, local_path: str, sandbox_path: str, ignore_patterns: List[str]) -> bool:
        """Copy directory to Docker container using tar."""
        if not self.container:
            raise RuntimeError("Container not initialized")

        import tarfile
        import io
        from pathlib import Path
        from core.project_utils import should_ignore

        local = Path(local_path)
        tar_stream = io.BytesIO()

        with tarfile.open(fileobj=tar_stream, mode='w') as tar:
            for root, dirs, files in os.walk(local):
                # Filter ignored dirs
                dirs[:] = [d for d in dirs if not should_ignore(d, ignore_patterns)]

                for file in files:
                    if should_ignore(file, ignore_patterns):
                        continue

                    file_path = Path(root) / file
                    arcname = file_path.relative_to(local)
                    try:
                        tar.add(file_path, arcname=str(arcname))
                    except Exception as e:
                        print(f"Warning: Failed to add {arcname}: {e}")
                        continue

        tar_stream.seek(0)

        # Upload to container
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(
                None,
                lambda: self.container.put_archive(sandbox_path, tar_stream.getvalue())
            )
            return True
        except Exception as e:
            print(f"Error copying directory: {e}")
            return False

    async def list_directory_recursive(self, path: str) -> List[Dict[str, Any]]:
        """List all files recursively in Docker container."""
        if not self.container:
            raise RuntimeError("Container not initialized")

        # Use find command
        stdout, _, _ = await self.execute_bash(
            f"find {path} -type f -o -type d | head -1000"
        )

        files = []
        for line in stdout.split('\n'):
            line = line.strip()
            if not line or line == path:
                continue

            # Determine type
            is_file_stdout, _, _ = await self.execute_bash(f"test -f {line} && echo 'file' || echo 'dir'")
            file_type = 'file' if 'file' in is_file_stdout else 'directory'

            # Get size if file
            size = None
            if file_type == 'file':
                size_stdout, _, _ = await self.execute_bash(f"stat -c%s {line} 2>/dev/null")
                try:
                    size = int(size_stdout.strip())
                except:
                    pass

            files.append({
                'path': line,
                'type': file_type,
                'size': size
            })

        return files

    async def get_file_hash(self, path: str) -> str:
        """Get SHA256 hash of file in Docker container."""
        if not self.container:
            raise RuntimeError("Container not initialized")

        stdout, _, code = await self.execute_bash(f"sha256sum {path} 2>/dev/null")
        if code == 0 and stdout:
            return stdout.split()[0]
        return ""


def create_sandbox(sandbox_type: str, **kwargs) -> BaseSandbox:
    """Factory function to create the appropriate sandbox."""
    if sandbox_type == "e2b":
        api_key = kwargs.get("api_key")
        if not api_key:
            raise ValueError("E2B API key required")
        return E2BSandbox(api_key)
    elif sandbox_type == "docker":
        image = kwargs.get("image", "python:3.11-slim")
        return DockerSandbox(image)
    else:
        raise ValueError(f"Unknown sandbox type: {sandbox_type}")
