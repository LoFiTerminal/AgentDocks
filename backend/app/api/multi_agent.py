"""Multi-Agent API endpoints."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json
import asyncio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

from models.schemas import (
    MultiAgentRunRequest,
    MultiAgentStatusResponse,
    MultiAgentMessagesResponse,
    MultiAgentResultResponse,
    AgentStatusInfo,
    AgentMessage
)
from app.config import get_config
from core.orchestrator import Orchestrator
from core.sandbox import create_sandbox
from core.providers import create_provider

router = APIRouter(prefix="/api/multi-agent", tags=["multi-agent"])

# Global orchestrator instance (one per session)
_active_orchestrator: Orchestrator = None


async def get_or_create_orchestrator(config) -> Orchestrator:
    """Get existing orchestrator or create new one."""
    global _active_orchestrator

    if _active_orchestrator is None:
        # Create sandbox (will be initialized in context manager)
        sandbox_kwargs = {}
        if config.sandbox == "e2b" and config.e2bApiKey:
            sandbox_kwargs["api_key"] = config.e2bApiKey

        sandbox = create_sandbox(config.sandbox, **sandbox_kwargs)

        # Create provider
        provider = create_provider(
            config.provider,
            config.apiKey
        )

        # Create orchestrator
        _active_orchestrator = Orchestrator(
            sandbox=sandbox,
            provider=provider,
            model=config.model
        )

    return _active_orchestrator


@router.post("/run")
async def run_multi_agent_workflow(request: MultiAgentRunRequest):
    """
    Execute a multi-agent workflow.
    Returns streaming updates about agent progress.
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
    model = request.model or config.model

    # Create orchestrator
    try:
        orchestrator = await get_or_create_orchestrator(config)
        orchestrator.model = model  # Update model if specified
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create orchestrator: {str(e)}"
        )

    # Stream workflow execution
    async def event_generator():
        # Create queue for status updates
        status_queue = asyncio.Queue()
        workflow_done = asyncio.Event()
        workflow_result = None
        workflow_error = None

        # Status callback that puts messages in queue
        async def status_callback(message: str):
            await status_queue.put(message)

        try:
            # Send initial status
            yield f"data: {json.dumps({'type': 'status', 'data': {'message': f'Starting {request.workflow} workflow...'}})}\n\n"

            orchestrator.set_status_callback(status_callback)

            # Run workflow in background task
            async def run_workflow():
                nonlocal workflow_result, workflow_error
                try:
                    if request.workflow == "feature":
                        workflow_result = await orchestrator.execute_feature_workflow(
                            task=request.task,
                            context=request.context or {}
                        )
                    elif request.workflow == "debug":
                        workflow_result = await orchestrator.execute_debug_workflow(
                            task=request.task,
                            context=request.context or {}
                        )
                    else:
                        raise ValueError(f"Unknown workflow type: {request.workflow}")
                except Exception as e:
                    workflow_error = e
                finally:
                    workflow_done.set()

            # Start workflow task
            workflow_task = asyncio.create_task(run_workflow())

            # Stream status updates as they come
            while not workflow_done.is_set():
                try:
                    # Wait for status message with timeout
                    message = await asyncio.wait_for(status_queue.get(), timeout=0.5)
                    yield f"data: {json.dumps({'type': 'status', 'data': {'message': message}})}\n\n"
                except asyncio.TimeoutError:
                    # No message yet, continue waiting
                    continue

            # Drain any remaining messages
            while not status_queue.empty():
                message = await status_queue.get()
                yield f"data: {json.dumps({'type': 'status', 'data': {'message': message}})}\n\n"

            # Wait for workflow to complete
            await workflow_task

            # Check for errors
            if workflow_error:
                raise workflow_error

            # Log result for debugging
            logger.info(f"📊 API: Final workflow result keys: {list(workflow_result.keys()) if workflow_result else 'None'}")
            if workflow_result:
                logger.info(f"📊 API: Result has plan: {'plan' in workflow_result}")
                logger.info(f"📊 API: Result has implementation: {'implementation' in workflow_result}")
                logger.info(f"📊 API: Result has test_results: {'test_results' in workflow_result}")
                logger.info(f"📊 API: Result has review_decision: {'review_decision' in workflow_result}")
                if 'implementation' in workflow_result:
                    logger.info(f"📊 API: Implementation preview: {workflow_result['implementation'][:200]}")

            # Send completion event
            logger.info(f"📊 API: Sending result message with {len(str(workflow_result))} chars")
            yield f"data: {json.dumps({'type': 'result', 'data': workflow_result})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'data': {'success': workflow_result.get('success', False)}})}\n\n"
            logger.info("📊 API: Result and done messages sent")

        except Exception as e:
            error_msg = str(e)
            if "api_key" in error_msg.lower():
                error_msg = "Invalid API key. Please check your configuration."
            elif "sandbox" in error_msg.lower():
                error_msg = f"Sandbox error: {error_msg}"

            yield f"data: {json.dumps({'type': 'error', 'data': {'message': error_msg}})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


@router.get("/status", response_model=MultiAgentStatusResponse)
async def get_multi_agent_status():
    """
    Get current status of all agents in the multi-agent system.
    """
    global _active_orchestrator

    if _active_orchestrator is None:
        return MultiAgentStatusResponse(
            agents=[],
            total_agents=0,
            active_agents=0
        )

    # Get agent statuses from orchestrator
    agent_statuses = _active_orchestrator.get_agent_statuses()

    # Count active agents
    active_count = sum(
        1 for agent in agent_statuses
        if agent.get("status") in ["thinking", "working", "waiting"]
    )

    return MultiAgentStatusResponse(
        agents=[
            AgentStatusInfo(
                agent_id=agent["agent_id"],
                role=agent["role"],
                status=agent["status"],
                current_task=agent.get("current_task"),
                progress=agent.get("progress")
            )
            for agent in agent_statuses
        ],
        total_agents=len(agent_statuses),
        active_agents=active_count
    )


@router.get("/messages", response_model=MultiAgentMessagesResponse)
async def get_multi_agent_messages():
    """
    Get inter-agent communication history.
    """
    global _active_orchestrator

    if _active_orchestrator is None:
        return MultiAgentMessagesResponse(
            messages=[],
            total_messages=0
        )

    # Get message history from orchestrator
    message_history = _active_orchestrator.get_message_history()

    return MultiAgentMessagesResponse(
        messages=[
            AgentMessage(
                from_agent=msg["from_agent"],
                to_agent=msg["to_agent"],
                message_type=msg["message_type"],
                content=msg["content"],
                timestamp=msg["timestamp"]
            )
            for msg in message_history
        ],
        total_messages=len(message_history)
    )


@router.get("/context")
async def get_shared_context():
    """
    Get shared context data between agents.
    """
    global _active_orchestrator

    if _active_orchestrator is None:
        return {"data": {}}

    return {"data": _active_orchestrator.get_shared_data()}


@router.post("/reset")
async def reset_multi_agent_system():
    """
    Reset the multi-agent system (clear all agents and state).
    """
    global _active_orchestrator
    _active_orchestrator = None

    return {"success": True, "message": "Multi-agent system reset"}


@router.get("/workflows")
async def get_available_workflows():
    """
    Get list of available multi-agent workflows.
    """
    return {
        "workflows": [
            {
                "id": "feature",
                "name": "Feature Development",
                "description": "Full feature implementation workflow: Architect → Coder → Tester → Reviewer",
                "agents": ["architect", "coder", "tester", "reviewer"]
            },
            {
                "id": "debug",
                "name": "Debug & Fix",
                "description": "Debug workflow: Coder (investigate) → Tester (reproduce) → Coder (fix) → Tester (verify)",
                "agents": ["coder", "tester"]
            },
            {
                "id": "refactor",
                "name": "Code Refactoring",
                "description": "Refactoring workflow: Architect (plan) → Coder (refactor) → Tester (verify) → Reviewer (approve)",
                "agents": ["architect", "coder", "tester", "reviewer"]
            }
        ]
    }
