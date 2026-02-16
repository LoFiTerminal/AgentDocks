from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, config, agent, verify, runs, project

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

# CSRF protection middleware
@app.middleware("http")
async def csrf_middleware(request: Request, call_next):
    """Add SameSite=Strict to all cookies for CSRF protection."""
    response = await call_next(request)

    # Set SameSite=Strict on all cookies
    if 'set-cookie' in response.headers:
        cookies = response.headers.get_list('set-cookie')
        response.headers._list = [
            (k, v + '; SameSite=Strict' if k.lower() == 'set-cookie' else v)
            for k, v in response.headers._list
        ]

    return response

# Include routers
app.include_router(health.router)
app.include_router(config.router)
app.include_router(verify.router)
app.include_router(runs.router)
app.include_router(agent.router)
app.include_router(project.router)
