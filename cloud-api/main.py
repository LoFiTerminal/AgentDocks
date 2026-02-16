"""
AgentDocks Cloud API - Minimal FastAPI service for shared agent runs.
Designed for Railway deployment with Cloudflare R2 storage.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import random
import string
from collections import defaultdict
import time

from storage import get_storage

app = FastAPI(
    title="AgentDocks Cloud API",
    description="Shared agent runs storage service",
    version="1.0.0"
)

# CORS - allow all origins for shared runs (public content)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting (in-memory, simple implementation)
rate_limit_store = defaultdict(list)
RATE_LIMIT_SHARES_PER_HOUR = 20
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds


def check_rate_limit(ip: str) -> bool:
    """Check if IP has exceeded rate limit."""
    now = time.time()
    # Clean old entries
    rate_limit_store[ip] = [
        timestamp for timestamp in rate_limit_store[ip]
        if now - timestamp < RATE_LIMIT_WINDOW
    ]
    # Check limit
    if len(rate_limit_store[ip]) >= RATE_LIMIT_SHARES_PER_HOUR:
        return False
    # Add current request
    rate_limit_store[ip].append(now)
    return True


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


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/runs/share")
async def share_run(request: ShareRunRequest, http_request: Request):
    """
    Save an agent run and generate a shareable link.
    Rate limited to 20 shares per hour per IP.
    """
    # Get client IP
    client_ip = http_request.client.host

    # Check rate limit
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Maximum 20 shares per hour."
        )

    try:
        storage = get_storage()

        # Generate unique ID
        share_id = generate_share_id()
        attempts = 0
        while storage.exists(share_id) and attempts < 10:
            share_id = generate_share_id()
            attempts += 1

        if attempts >= 10:
            raise HTTPException(status_code=500, detail="Failed to generate unique ID")

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

        # Store run
        storage.store_run(share_id, run_data)

        # Return share URL (frontend will be on agentdocks.vercel.app)
        site_url = "https://agentdocks.vercel.app"
        return {
            "id": share_id,
            "url": f"{site_url}/run/{share_id}"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to share run: {str(e)}")


@app.get("/api/runs/shared/{share_id}")
async def get_shared_run(share_id: str):
    """
    Retrieve a shared agent run by ID.
    """
    try:
        # Validate ID format (alphanumeric, 8 chars)
        if not share_id.isalnum() or len(share_id) != 8:
            raise HTTPException(status_code=400, detail="Invalid share ID format")

        storage = get_storage()
        run_data = storage.get_run(share_id)

        if run_data is None:
            raise HTTPException(status_code=404, detail="Run not found")

        return run_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve run: {str(e)}")
