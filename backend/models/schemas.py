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
    # Project fields
    current_project: Optional["ProjectState"] = None
    recent_projects: List["RecentProject"] = []

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

# Project-related schemas
class ProjectState(BaseModel):
    """Current project state"""
    project_path: Optional[str] = None
    project_name: Optional[str] = None
    opened_at: Optional[str] = None  # ISO timestamp

class RecentProject(BaseModel):
    """Recent project metadata"""
    path: str
    name: str
    last_opened: str  # ISO timestamp
    project_type: Optional[str] = None
    file_count: Optional[int] = None
    size_mb: Optional[float] = None

class ProjectOpenRequest(BaseModel):
    """Request to open a project"""
    project_path: str

class ProjectTreeNode(BaseModel):
    """File tree node"""
    name: str
    path: str  # Relative to project root
    type: Literal["file", "directory"]
    size: Optional[int] = None
    children: Optional[List["ProjectTreeNode"]] = None

class FileChange(BaseModel):
    """Tracked file change"""
    path: str  # Relative to project root
    type: Literal["created", "modified", "deleted"]
    original_content: Optional[str] = None
    new_content: Optional[str] = None
    diff: Optional[str] = None

class ProjectChanges(BaseModel):
    """All changes in current project"""
    changes: List[FileChange]
    total_files: int
    created_count: int
    modified_count: int
    deleted_count: int

class ApplyChangesRequest(BaseModel):
    """Request to apply changes to local filesystem"""
    approved_changes: List[str]  # List of file paths to apply
    create_backup: bool = True
