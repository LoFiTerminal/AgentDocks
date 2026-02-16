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

@router.get("/tree")
async def get_project_tree():
    """Get file tree of current project in sandbox."""
    global _active_project_manager

    if not _active_project_manager:
        raise HTTPException(
            status_code=400,
            detail="No active project in sandbox. Run an agent task first to sync the project."
        )

    try:
        tree = await _active_project_manager.build_file_tree()
        return tree
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build file tree: {str(e)}")

@router.get("/file")
async def get_project_file(path: str):
    """Read a file from the sandbox project."""
    global _active_project_manager

    if not _active_project_manager:
        raise HTTPException(
            status_code=400,
            detail="No active project in sandbox. Run an agent task first."
        )

    # Validate path (prevent directory traversal)
    if '..' in path or path.startswith('/'):
        raise HTTPException(status_code=400, detail="Invalid path")

    try:
        full_path = f"/workspace/{path}"
        content = await _active_project_manager.sandbox.read_file(full_path)
        return {"path": path, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")

@router.get("/changes")
async def get_project_changes():
    """Detect and return all changes in the sandbox."""
    global _active_project_manager

    if not _active_project_manager:
        raise HTTPException(
            status_code=400,
            detail="No active project in sandbox"
        )

    try:
        changes = await _active_project_manager.detect_changes()

        return ProjectChanges(
            changes=changes,
            total_files=len(changes),
            created_count=len([c for c in changes if c.type == 'created']),
            modified_count=len([c for c in changes if c.type == 'modified']),
            deleted_count=len([c for c in changes if c.type == 'deleted'])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to detect changes: {str(e)}")

@router.post("/apply-changes")
async def apply_project_changes(request: ApplyChangesRequest):
    """Apply approved changes to local filesystem."""
    global _active_project_manager

    if not _active_project_manager:
        raise HTTPException(
            status_code=400,
            detail="No active project"
        )

    try:
        # Get all changes
        all_changes = await _active_project_manager.detect_changes()

        # Filter to approved only
        approved = [c for c in all_changes if c.path in request.approved_changes]

        if not approved:
            return {
                "success": False,
                "message": "No valid changes to apply",
                "applied": [],
                "failed": []
            }

        # Apply changes
        result = await _active_project_manager.apply_changes(
            approved,
            create_backup_flag=request.create_backup
        )

        return {
            "success": True,
            "message": f"Applied {len(result['applied'])} changes",
            "applied": result['applied'],
            "failed": result['failed'],
            "backup_path": result.get('backup_path')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply changes: {str(e)}")
