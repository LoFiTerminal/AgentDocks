"""Shareable agent runs API."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import os
import random
import string
from pathlib import Path
from datetime import datetime

router = APIRouter(prefix="/api/runs", tags=["runs"])

# Shared runs directory
SHARED_RUNS_DIR = Path.home() / ".agentdocks" / "shared-runs"

# Site URL for share links (from env or default to localhost)
SITE_URL = os.getenv("SITE_URL", "http://localhost:3000")


def ensure_shared_runs_dir():
    """Create shared runs directory if it doesn't exist."""
    SHARED_RUNS_DIR.mkdir(parents=True, exist_ok=True)


def generate_share_id() -> str:
    """Generate a short 8-character alphanumeric ID."""
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for _ in range(8))


class ShareRunRequest(BaseModel):
    messages: List[Dict[str, Any]]
    query: str
    model: str
    duration_seconds: float
    tool_count: int


@router.post("/share")
async def share_run(request: ShareRunRequest):
    """
    Save an agent run and generate a shareable link.
    """
    try:
        ensure_shared_runs_dir()

        # Generate unique ID
        share_id = generate_share_id()

        # Check if ID already exists (very unlikely but handle it)
        attempts = 0
        while (SHARED_RUNS_DIR / f"{share_id}.json").exists() and attempts < 10:
            share_id = generate_share_id()
            attempts += 1

        # Prepare run data
        run_data = {
            "id": share_id,
            "messages": request.messages,
            "query": request.query,
            "model": request.model,
            "duration_seconds": request.duration_seconds,
            "tool_count": request.tool_count,
            "created_at": datetime.utcnow().isoformat(),
        }

        # Save to file
        file_path = SHARED_RUNS_DIR / f"{share_id}.json"
        with open(file_path, 'w') as f:
            json.dump(run_data, f, indent=2)

        # Return share URL
        return {
            "id": share_id,
            "url": f"{SITE_URL}/run/{share_id}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to share run: {str(e)}")


@router.get("/shared/{share_id}")
async def get_shared_run(share_id: str):
    """
    Retrieve a shared agent run by ID.
    """
    try:
        ensure_shared_runs_dir()

        # Validate ID format (alphanumeric, 8 chars)
        if not share_id.isalnum() or len(share_id) != 8:
            raise HTTPException(status_code=400, detail="Invalid share ID format")

        # Read file
        file_path = SHARED_RUNS_DIR / f"{share_id}.json"

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Run not found")

        with open(file_path, 'r') as f:
            run_data = json.load(f)

        return run_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve run: {str(e)}")


# Ensure directory exists on module import
ensure_shared_runs_dir()
