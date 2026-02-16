"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
async def root():
    return {
        "message": "AgentDocks API",
        "version": "0.1.0",
        "status": "running",
        "engine": "AgentDocks Engine (Custom)"
    }


@router.get("/health")
async def health_check():
    return {"status": "healthy"}
