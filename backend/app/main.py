from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, config, agent, verify, runs

app = FastAPI(
    title="AgentDocks API",
    description="Backend API for AgentDocks.ai - AI agents in disposable sandboxes with custom AgentDocks Engine",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(config.router)
app.include_router(verify.router)
app.include_router(runs.router)
app.include_router(agent.router)
