"""Core agent loop - the heart of AgentDocks."""

from typing import AsyncGenerator, Dict, Any, List
import json
import shlex
from .providers import create_provider
from .sandbox import create_sandbox
from .tools import TOOLS
from .system_prompt import AGENT_SYSTEM_PROMPT
from .stream import (
    stream_status,
    stream_tool_use,
    stream_tool_result,
    stream_text,
    stream_error,
    stream_done
)


class AgentRunner:
    """Orchestrates the agent execution loop."""

    def __init__(
        self,
        provider_type: str,
        provider_api_key: str,
        sandbox_type: str,
        model: str,
        sandbox_api_key: str = None
    ):
        self.provider_type = provider_type
        self.provider_api_key = provider_api_key
        self.sandbox_type = sandbox_type
        self.sandbox_api_key = sandbox_api_key
        self.model = model

    async def run(
        self,
        query: str,
        max_turns: int = 10,
        uploaded_files: List[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Main agent loop:
        1. Create sandbox
        2. Upload any files
        3. Send query to AI with tools
        4. Execute tool calls in sandbox
        5. Send results back to AI
        6. Repeat until done
        7. Destroy sandbox
        """
        sandbox = None
        try:
            # Initialize provider
            yield await stream_status("Initializing AI provider...")
            provider = create_provider(
                self.provider_type,
                self.provider_api_key
            )

            # Create sandbox
            yield await stream_status(f"Creating {self.sandbox_type} sandbox...")
            sandbox_kwargs = {}
            if self.sandbox_type == "e2b" and self.sandbox_api_key:
                sandbox_kwargs["api_key"] = self.sandbox_api_key

            sandbox = create_sandbox(self.sandbox_type, **sandbox_kwargs)
            async with sandbox:
                yield await stream_status("Sandbox ready!")

                # Ensure /workspace/ directory exists
                await sandbox.execute_bash("mkdir -p /workspace")

                # Sync project if one is open
                from app.config import get_config
                from core.project_manager import ProjectManager
                import app.api.project as project_api

                config = get_config()
                project_manager = None

                if config and config.current_project:
                    yield await stream_status("Loading project into sandbox...")
                    try:
                        project_path = config.current_project.project_path
                        project_manager = ProjectManager(sandbox, project_path)

                        # Copy project to sandbox
                        success = await project_manager.copy_to_sandbox()
                        if success:
                            # Snapshot file hashes for change detection
                            await project_manager.snapshot_hashes()

                            # Store in global for API access
                            project_api._active_project_manager = project_manager

                            yield await stream_status(f"Project '{config.current_project.project_name}' loaded!")
                        else:
                            yield await stream_status("Warning: Failed to load project")
                    except Exception as e:
                        yield await stream_status(f"Warning: Failed to sync project: {str(e)}")

                # Upload files if provided
                if uploaded_files:
                    yield await stream_status(f"Uploading {len(uploaded_files)} files...")
                    # Create /workspace/ directory first
                    await sandbox.execute_bash("mkdir -p /workspace")
                    for file_data in uploaded_files:
                        # Upload to /workspace/
                        file_path = f"/workspace/{file_data['name']}"
                        await sandbox.upload_file(
                            file_path,
                            file_data["content"]
                        )
                    yield await stream_status(f"Uploaded {len(uploaded_files)} files to /workspace/")

                # Initialize conversation
                messages = [
                    {
                        "role": "user",
                        "content": query
                    }
                ]

                # Agent loop
                for turn in range(max_turns):
                    yield await stream_status(f"AI thinking... (turn {turn + 1}/{max_turns})")

                    # Get AI response
                    response = await provider.complete(
                        messages=messages,
                        tools=TOOLS,
                        model=self.model,
                        system=AGENT_SYSTEM_PROMPT
                    )

                    # Process response content blocks
                    assistant_content = []
                    has_tool_use = False

                    for block in response.content:
                        if block.type == "text":
                            # Stream text to user
                            yield await stream_text(block.text)
                            assistant_content.append({
                                "type": "text",
                                "text": block.text
                            })

                        elif block.type == "tool_use":
                            has_tool_use = True
                            # Stream tool use
                            yield await stream_tool_use(block.name, block.input)

                            # Execute tool
                            try:
                                result = await self._execute_tool(
                                    sandbox,
                                    block.name,
                                    block.input
                                )
                                yield await stream_tool_result(result, is_error=False)

                                # Add to conversation
                                assistant_content.append({
                                    "type": "tool_use",
                                    "id": block.id,
                                    "name": block.name,
                                    "input": block.input
                                })

                                # Tool result message
                                messages.append({
                                    "role": "assistant",
                                    "content": assistant_content
                                })

                                messages.append({
                                    "role": "user",
                                    "content": [
                                        {
                                            "type": "tool_result",
                                            "tool_use_id": block.id,
                                            "content": str(result)
                                        }
                                    ]
                                })

                                assistant_content = []  # Reset for next turn

                            except Exception as e:
                                error_msg = str(e)
                                yield await stream_tool_result(error_msg, is_error=True)

                                # Add error to conversation
                                messages.append({
                                    "role": "assistant",
                                    "content": assistant_content
                                })

                                messages.append({
                                    "role": "user",
                                    "content": [
                                        {
                                            "type": "tool_result",
                                            "tool_use_id": block.id,
                                            "content": f"Error: {error_msg}",
                                            "is_error": True
                                        }
                                    ]
                                })

                                assistant_content = []

                    # If no tool use, we're done
                    if not has_tool_use:
                        if assistant_content:
                            messages.append({
                                "role": "assistant",
                                "content": assistant_content
                            })
                        break

                # Task complete
                yield await stream_status("Task complete. Cleaning up...")

                # Detect changes if project was loaded
                if project_manager:
                    try:
                        import app.api.project as project_api
                        yield await stream_status("Detecting changes...")
                        changes = await project_manager.detect_changes()
                        # Cache changes in global for API access
                        project_api._cached_changes = changes
                        if changes:
                            yield await stream_status(f"Found {len(changes)} file changes")
                    except Exception as e:
                        print(f"Error detecting changes: {e}")

        except Exception as e:
            yield await stream_error(f"Agent error: {str(e)}")

        finally:
            # Ensure sandbox is destroyed
            if sandbox:
                try:
                    await sandbox.destroy()
                except Exception as e:
                    print(f"Error destroying sandbox: {e}")

            yield await stream_done()

    async def _execute_tool(
        self,
        sandbox,
        tool_name: str,
        tool_input: Dict[str, Any]
    ) -> Any:
        """Execute a tool call in the sandbox."""
        if tool_name == "bash":
            command = tool_input["command"]
            stdout, stderr, exit_code = await sandbox.execute_bash(command)
            return {
                "stdout": stdout,
                "stderr": stderr,
                "exit_code": exit_code
            }

        elif tool_name == "write":
            path = tool_input["path"]
            # Prepend /workspace/ if relative path
            if not path.startswith('/'):
                path = f"/workspace/{path}"
            content = tool_input["content"]
            success = await sandbox.write_file(path, content)
            return {"success": success, "path": path}

        elif tool_name == "read":
            path = tool_input["path"]
            # Prepend /workspace/ if relative path
            if not path.startswith('/'):
                path = f"/workspace/{path}"
            content = await sandbox.read_file(path)
            return {"content": content}

        elif tool_name == "edit":
            path = tool_input["path"]
            # Prepend /workspace/ if relative path
            if not path.startswith('/'):
                path = f"/workspace/{path}"
            old_text = tool_input["old_text"]
            new_text = tool_input["new_text"]

            # Read file
            content = await sandbox.read_file(path)

            # Replace text
            if old_text not in content:
                raise ValueError(f"Text not found in file: {old_text}")

            new_content = content.replace(old_text, new_text, 1)

            # Write back
            await sandbox.write_file(path, new_content)
            return {"success": True, "path": path}

        elif tool_name == "glob":
            pattern = tool_input["pattern"]
            directory = tool_input.get("directory", ".")

            # Use bash to run glob with proper escaping
            stdout, _, _ = await sandbox.execute_bash(
                f"find {shlex.quote(directory)} -name {shlex.quote(pattern)} 2>/dev/null"
            )
            files = [f.strip() for f in stdout.split('\n') if f.strip()]
            return {"files": files}

        elif tool_name == "grep":
            pattern = tool_input["pattern"]
            path = tool_input.get("path", ".")

            # Use bash grep with proper escaping
            stdout, _, exit_code = await sandbox.execute_bash(
                f"grep -r {shlex.quote(pattern)} {shlex.quote(path)} 2>/dev/null || true"
            )
            return {"matches": stdout}

        else:
            raise ValueError(f"Unknown tool: {tool_name}")
