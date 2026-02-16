"""Manages project lifecycle: open, sync, track changes, apply."""

from typing import Dict, List, Optional
from pathlib import Path
import difflib
from .sandbox import BaseSandbox
from .project_utils import (
    load_gitignore_patterns,
    create_backup,
    should_ignore
)
from models.schemas import FileChange, ProjectTreeNode

class ProjectManager:
    """Manages project state and change tracking."""

    def __init__(self, sandbox: BaseSandbox, project_path: str):
        self.sandbox = sandbox
        self.project_path = Path(project_path)
        self.project_name = self.project_path.name
        self.ignore_patterns = load_gitignore_patterns(self.project_path)
        self.file_hashes: Dict[str, str] = {}  # Track original hashes

    async def copy_to_sandbox(self) -> bool:
        """Copy project to sandbox /workspace/."""
        sandbox_path = "/workspace"
        return await self.sandbox.copy_directory(
            str(self.project_path),
            sandbox_path,
            self.ignore_patterns
        )

    async def snapshot_hashes(self):
        """Snapshot all file hashes for change detection."""
        files = await self.sandbox.list_directory_recursive("/workspace")
        for file_info in files:
            if file_info['type'] == 'file':
                path = file_info['path']
                hash_val = await self.sandbox.get_file_hash(path)
                if hash_val:
                    self.file_hashes[path] = hash_val

    async def detect_changes(self) -> List[FileChange]:
        """Detect all changes: created, modified, deleted."""
        changes = []
        current_files_info = await self.sandbox.list_directory_recursive("/workspace")
        current_paths = {f['path'] for f in current_files_info if f['type'] == 'file'}

        # Detect modified and deleted
        for orig_path, orig_hash in self.file_hashes.items():
            if orig_path in current_paths:
                # Check if modified
                current_hash = await self.sandbox.get_file_hash(orig_path)
                if current_hash and current_hash != orig_hash:
                    # Generate diff
                    try:
                        orig_content = await self._read_local_file(orig_path)
                        new_content = await self.sandbox.read_file(orig_path)
                        diff = self._generate_diff(orig_path, orig_content, new_content)

                        changes.append(FileChange(
                            path=orig_path.replace('/workspace/', ''),
                            type='modified',
                            original_content=orig_content,
                            new_content=new_content,
                            diff=diff
                        ))
                    except Exception as e:
                        print(f"Error processing modified file {orig_path}: {e}")
            else:
                # File deleted
                try:
                    orig_content = await self._read_local_file(orig_path)
                    changes.append(FileChange(
                        path=orig_path.replace('/workspace/', ''),
                        type='deleted',
                        original_content=orig_content,
                        new_content=None,
                        diff=None
                    ))
                except Exception as e:
                    print(f"Error processing deleted file {orig_path}: {e}")

        # Detect created files
        for path in current_paths:
            if path not in self.file_hashes:
                try:
                    new_content = await self.sandbox.read_file(path)
                    changes.append(FileChange(
                        path=path.replace('/workspace/', ''),
                        type='created',
                        original_content=None,
                        new_content=new_content,
                        diff=None
                    ))
                except Exception as e:
                    print(f"Error processing created file {path}: {e}")

        return changes

    def _generate_diff(self, path: str, orig: str, new: str) -> str:
        """Generate unified diff."""
        orig_lines = orig.splitlines(keepends=True)
        new_lines = new.splitlines(keepends=True)
        diff = difflib.unified_diff(
            orig_lines,
            new_lines,
            fromfile=f"a/{path}",
            tofile=f"b/{path}",
            lineterm=''
        )
        return ''.join(diff)

    async def _read_local_file(self, sandbox_path: str) -> str:
        """Read file from local filesystem given sandbox path."""
        # Convert sandbox path to local path
        rel_path = sandbox_path.replace('/workspace/', '')
        local_path = self.project_path / rel_path
        try:
            with open(local_path, 'r') as f:
                return f.read()
        except Exception:
            return ""

    async def apply_changes(self, changes: List[FileChange], create_backup_flag: bool = True) -> Dict[str, any]:
        """Apply approved changes to local filesystem."""
        backup_path = None
        if create_backup_flag:
            try:
                backup_path = create_backup(self.project_path)
            except Exception as e:
                print(f"Warning: Failed to create backup: {e}")

        applied = []
        failed = []

        for change in changes:
            local_path = self.project_path / change.path

            try:
                if change.type == 'created' or change.type == 'modified':
                    local_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(local_path, 'w') as f:
                        f.write(change.new_content)
                    applied.append(change.path)

                elif change.type == 'deleted':
                    if local_path.exists():
                        local_path.unlink()
                        applied.append(change.path)

            except Exception as e:
                failed.append({'path': change.path, 'error': str(e)})

        return {
            'applied': applied,
            'failed': failed,
            'backup_path': backup_path
        }

    async def build_file_tree(self) -> ProjectTreeNode:
        """Build recursive file tree."""
        files = await self.sandbox.list_directory_recursive("/workspace")

        # Build tree structure
        root = ProjectTreeNode(
            name=self.project_name,
            path="/workspace",
            type="directory",
            children=[]
        )

        # Group files by directory
        for file_info in files:
            path = file_info['path']
            if path == "/workspace":
                continue

            # Add to tree (simplified - just list files)
            rel_path = path.replace('/workspace/', '')
            parts = rel_path.split('/')
            name = parts[-1]

            node = ProjectTreeNode(
                name=name,
                path=rel_path,
                type=file_info['type'],
                size=file_info.get('size')
            )

            # For simplicity, add all files to root level
            # In production, you'd build proper nested structure
            if root.children is None:
                root.children = []
            root.children.append(node)

        return root
