"""Project management API endpoints."""

from fastapi import APIRouter, HTTPException
from typing import Optional
from pathlib import Path
from datetime import datetime

from models.schemas import (
    ProjectOpenRequest, ProjectTreeNode, ProjectChanges,
    FileChange, ApplyChangesRequest, RecentProject, ProjectState
)
from app.config import get_config, save_config
from core.project_utils import (
    validate_project_path,
    get_project_size,
    load_gitignore_patterns,
    detect_project_type,
    MAX_PROJECT_SIZE_MB,
    MAX_FILES
)
from core.project_manager import ProjectManager
from core.sandbox import create_sandbox

router = APIRouter(prefix="/api/project", tags=["project"])

# Global project manager (one active project per session)
_active_project_manager: Optional[ProjectManager] = None

@router.post("/open")
async def open_project(request: ProjectOpenRequest):
    """
    Open a project folder.
    1. Validate path
    2. Check size limits
    3. Detect project type
    4. Update config
    """
    # Validate
    is_valid, error = validate_project_path(request.project_path)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    project_path = Path(request.project_path).resolve()

    # Load ignore patterns
    ignore_patterns = load_gitignore_patterns(project_path)

    # Check size
    size_bytes, file_count = get_project_size(project_path, ignore_patterns)
    size_mb = size_bytes / (1024 * 1024)

    if size_mb > MAX_PROJECT_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Project too large: {size_mb:.1f}MB (max {MAX_PROJECT_SIZE_MB}MB)"
        )

    if file_count > MAX_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Too many files: {file_count} (max {MAX_FILES})"
        )

    # Detect type
    project_type = detect_project_type(project_path)

    # Update config
    config = get_config()
    if not config:
        raise HTTPException(status_code=400, detail="Configuration not found. Please complete onboarding first.")

    # Add to recent projects
    recent = RecentProject(
        path=str(project_path),
        name=project_path.name,
        last_opened=datetime.now().isoformat(),
        project_type=project_type,
        file_count=file_count,
        size_mb=round(size_mb, 2)
    )

    # Update recent list (max 10)
    config.recent_projects = [
        r for r in config.recent_projects if r.path != str(project_path)
    ]
    config.recent_projects.insert(0, recent)
    config.recent_projects = config.recent_projects[:10]

    # Set current project
    config.current_project = ProjectState(
        project_path=str(project_path),
        project_name=project_path.name,
        opened_at=datetime.now().isoformat()
    )

    save_config(config)

    return {
        "success": True,
        "project": {
            "path": str(project_path),
            "name": project_path.name,
            "type": project_type,
            "size_mb": round(size_mb, 2),
            "file_count": file_count
        }
    }

@router.get("/recent")
async def get_recent_projects():
    """Get list of recent projects."""
    config = get_config()
    if not config:
        return {"recent_projects": []}

    return {"recent_projects": config.recent_projects}

@router.post("/close")
async def close_project():
    """Close current project."""
    global _active_project_manager
    _active_project_manager = None

    config = get_config()
    if config:
        config.current_project = None
        save_config(config)

    return {"success": True}
