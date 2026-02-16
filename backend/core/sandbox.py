"""Sandbox abstraction layer for code execution."""

from abc import ABC, abstractmethod
from typing import Tuple, List, Optional
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
