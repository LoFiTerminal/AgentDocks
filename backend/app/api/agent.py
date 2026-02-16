"""Agent API endpoints."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import List, Optional
import json

from models.schemas import AgentRunRequest
from app.config import get_config
from core.agent_runner import AgentRunner

router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.post("/run")
async def run_agent(request: AgentRunRequest):
    """
    Run an agent task with streaming response.
    Returns Server-Sent Events (SSE) stream.
    """
    # Get config
    config = get_config()
    if not config:
        raise HTTPException(status_code=400, detail="Configuration not found. Please complete onboarding.")

    # Use model from request or config
    model = request.model or config.model

    # Create agent runner
    runner = AgentRunner(
        provider_type=config.provider,
        provider_api_key=config.apiKey,
        sandbox_type=config.sandbox,
        sandbox_api_key=config.e2bApiKey if config.sandbox == "e2b" else None,
        model=model
    )

    # Run agent and stream results
    async def event_generator():
        async for event in runner.run(
            query=request.query,
            max_turns=request.max_turns
        ):
            yield event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


@router.post("/run-with-files")
async def run_agent_with_files(
    query: str = Form(...),
    model: Optional[str] = Form(None),
    max_turns: int = Form(10),
    files: List[UploadFile] = File(...)
):
    """
    Run an agent task with file uploads.
    Returns Server-Sent Events (SSE) stream.
    """
    # Get config
    config = get_config()
    if not config:
        raise HTTPException(status_code=400, detail="Configuration not found")

    # Use model from request or config
    model = model or config.model

    # Read uploaded files
    uploaded_files = []
    for file in files:
        content = await file.read()
        uploaded_files.append({
            "name": file.filename,
            "content": content
        })

    # Create agent runner
    runner = AgentRunner(
        provider_type=config.provider,
        provider_api_key=config.apiKey,
        sandbox_type=config.sandbox,
        sandbox_api_key=config.e2bApiKey if config.sandbox == "e2b" else None,
        model=model
    )

    # Run agent with files
    async def event_generator():
        async for event in runner.run(
            query=query,
            max_turns=max_turns,
            uploaded_files=uploaded_files
        ):
            yield event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
