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
        raise HTTPException(
            status_code=400,
            detail="Configuration not found. Please complete onboarding first by visiting /onboarding."
        )

    # Validate required fields
    if not config.apiKey:
        raise HTTPException(
            status_code=400,
            detail=f"{config.provider.title()} API key not configured. Please complete onboarding."
        )

    if config.sandbox == "e2b" and not config.e2bApiKey:
        raise HTTPException(
            status_code=400,
            detail="E2B API key not configured. Please complete onboarding or switch to Docker sandbox."
        )

    # Use model from request or config
    model = request.model or config.model

    # Create agent runner and stream results
    async def event_generator():
        try:
            runner = AgentRunner(
                provider_type=config.provider,
                provider_api_key=config.apiKey,
                sandbox_type=config.sandbox,
                sandbox_api_key=config.e2bApiKey if config.sandbox == "e2b" else None,
                model=model
            )

            async for event in runner.run(
                query=request.query,
                max_turns=request.max_turns
            ):
                yield event
        except Exception as e:
            # Stream error to client
            error_msg = str(e)
            if "api_key" in error_msg.lower():
                error_msg = "Invalid API key. Please check your configuration."
            elif "sandbox" in error_msg.lower() or "docker" in error_msg.lower():
                error_msg = f"Sandbox creation failed: {error_msg}"
            elif "model" in error_msg.lower():
                error_msg = f"Invalid model: {error_msg}"

            yield f"data: {json.dumps({'type': 'error', 'data': {'message': error_msg}})}\n\n"

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
        raise HTTPException(
            status_code=400,
            detail="Configuration not found. Please complete onboarding first."
        )

    # Validate required fields
    if not config.apiKey:
        raise HTTPException(
            status_code=400,
            detail=f"{config.provider.title()} API key not configured."
        )

    if config.sandbox == "e2b" and not config.e2bApiKey:
        raise HTTPException(
            status_code=400,
            detail="E2B API key not configured."
        )

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

    # Run agent with files
    async def event_generator():
        try:
            runner = AgentRunner(
                provider_type=config.provider,
                provider_api_key=config.apiKey,
                sandbox_type=config.sandbox,
                sandbox_api_key=config.e2bApiKey if config.sandbox == "e2b" else None,
                model=model
            )

            async for event in runner.run(
                query=query,
                max_turns=max_turns,
                uploaded_files=uploaded_files
            ):
                yield event
        except Exception as e:
            error_msg = str(e)
            if "api_key" in error_msg.lower():
                error_msg = "Invalid API key. Please check your configuration."
            elif "sandbox" in error_msg.lower() or "docker" in error_msg.lower():
                error_msg = f"Sandbox creation failed: {error_msg}"

            yield f"data: {json.dumps({'type': 'error', 'data': {'message': error_msg}})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
