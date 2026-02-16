from pydantic import BaseModel
from typing import Literal, Optional, List, Dict, Any

AIProvider = Literal['anthropic', 'openrouter', 'ollama']
SandboxProvider = Literal['e2b', 'docker']

class OnboardingConfig(BaseModel):
    provider: AIProvider
    apiKey: str
    model: str
    sandbox: SandboxProvider
    e2bApiKey: str = ""

class AgentRunRequest(BaseModel):
    query: str
    model: Optional[str] = None
    max_turns: int = 10
    timeout: int = 300  # seconds

class ToolUse(BaseModel):
    id: str
    name: str
    input: Dict[str, Any]

class ToolResult(BaseModel):
    tool_use_id: str
    content: Any
    is_error: bool = False

class SSEEvent(BaseModel):
    type: Literal["status", "tool_use", "tool_result", "text", "file", "error", "done"]
    data: Dict[str, Any]

class FileUpload(BaseModel):
    name: str
    content: bytes
    path: str
