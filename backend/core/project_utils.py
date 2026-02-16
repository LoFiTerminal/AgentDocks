"""Project management utilities with security validation."""

import os
import shutil
from pathlib import Path
from typing import List, Optional, Tuple
from datetime import datetime
import hashlib

# Security constants
MAX_PROJECT_SIZE_MB = 500
MAX_FILE_SIZE_MB = 10
MAX_FILES = 10000

# Default ignore patterns (respect .gitignore + add common)
DEFAULT_IGNORE_PATTERNS = [
    '.git', '.svn', '.hg',
    'node_modules', 'venv', 'env', '__pycache__',
    '.DS_Store', 'Thumbs.db',
    '*.pyc', '*.pyo', '*.so', '*.dylib',
    '.env', '.env.local', 'credentials.json',
    'dist', 'build', '.next', 'out',
    '.idea', '.vscode',
]

def validate_project_path(project_path: str) -> Tuple[bool, str]:
    """
    Validate project path for security.
    Returns: (is_valid, error_message)
    """
    try:
        path = Path(project_path).resolve()
    except Exception as e:
        return False, f"Invalid path: {str(e)}"

    # Must exist
    if not path.exists():
        return False, "Path does not exist"

    # Must be directory
    if not path.is_dir():
        return False, "Path must be a directory"

    # Must be readable
    if not os.access(path, os.R_OK):
        return False, "Directory is not readable"

    # Prevent sensitive system directories
    sensitive_dirs = ['/etc', '/var', '/usr', '/bin', '/sbin', '/System']
    if any(str(path).startswith(d) for d in sensitive_dirs):
        return False, "Cannot access system directories"

    return True, ""

def get_project_size(project_path: Path, ignore_patterns: List[str]) -> Tuple[int, int]:
    """
    Calculate project size and file count.
    Returns: (size_in_bytes, file_count)
    """
    total_size = 0
    file_count = 0

    for root, dirs, files in os.walk(project_path):
        # Filter ignored directories in-place
        dirs[:] = [d for d in dirs if not should_ignore(d, ignore_patterns)]

        for file in files:
            if should_ignore(file, ignore_patterns):
                continue

            file_path = Path(root) / file
            if file_path.is_file():
                try:
                    total_size += file_path.stat().st_size
                    file_count += 1
                except OSError:
                    continue

    return total_size, file_count

def should_ignore(name: str, patterns: List[str]) -> bool:
    """Check if file/dir should be ignored."""
    for pattern in patterns:
        if pattern.startswith('*'):
            if name.endswith(pattern[1:]):
                return True
        elif pattern.endswith('*'):
            if name.startswith(pattern[:-1]):
                return True
        else:
            if name == pattern:
                return True
    return False

def load_gitignore_patterns(project_path: Path) -> List[str]:
    """Load patterns from .gitignore if exists."""
    gitignore_path = project_path / '.gitignore'
    patterns = DEFAULT_IGNORE_PATTERNS.copy()

    if gitignore_path.exists():
        try:
            with open(gitignore_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        patterns.append(line)
        except Exception:
            pass

    return patterns

def detect_project_type(project_path: Path) -> Optional[str]:
    """Detect project type based on marker files."""
    markers = {
        'node': ['package.json', 'node_modules'],
        'python': ['requirements.txt', 'setup.py', 'pyproject.toml', 'venv'],
        'rust': ['Cargo.toml', 'Cargo.lock'],
        'go': ['go.mod', 'go.sum'],
        'java': ['pom.xml', 'build.gradle'],
        'ruby': ['Gemfile', 'Rakefile'],
    }

    for proj_type, files in markers.items():
        if any((project_path / f).exists() for f in files):
            return proj_type

    return None

def create_backup(project_path: Path) -> str:
    """
    Create a backup of the project.
    Returns backup directory path.
    """
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = Path.home() / '.agentdocks' / 'backups' / f"{project_path.name}_{timestamp}"
    backup_dir.parent.mkdir(parents=True, exist_ok=True)

    shutil.copytree(project_path, backup_dir, symlinks=False)
    return str(backup_dir)

def compute_file_hash(file_path: Path) -> str:
    """Compute SHA256 hash of file for change detection."""
    sha256 = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except Exception:
        return ""
