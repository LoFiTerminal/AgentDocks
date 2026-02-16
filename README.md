<div align="center">

# ⚡ AgentDocks.ai

**Run AI agents in disposable sandboxes with full privacy**

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/LoFiTerminal/AgentDocks?style=social)](https://github.com/LoFiTerminal/AgentDocks)
[![Privacy First](https://img.shields.io/badge/Privacy-First-green.svg)](https://github.com/LoFiTerminal/AgentDocks)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://github.com/LoFiTerminal/AgentDocks)

A local-first web application for running AI agents in disposable sandboxes. Built with a custom agent execution engine from the ground up.

[🚀 Quick Start](#installation) • [📖 Docs](#documentation) • [🐳 Docker](#docker-deployment) • [☁️ Deploy](#deployment)

---

### ⭐ [Star this repo on GitHub!](https://github.com/LoFiTerminal/AgentDocks)

If you find AgentDocks useful, give it a star to show your support and help others discover it!

</div>

---

## Features

- **5-Step Onboarding**: Welcome → Choose AI Provider → Configure API Keys → Select Sandbox → Confirm
- **Chat Interface**: Interact with AI agents through a familiar chat-like UI
- **Multiple AI Providers**: Support for Anthropic, OpenRouter, and Ollama
- **Flexible Sandboxes**: Run agents in E2B (cloud) or Docker (local) environments
- **Local-First**: Your data stays on your machine
- **Real-Time Streaming**: Watch your agents work step-by-step
- **Custom Agent Engine**: Fully self-contained, zero external agent framework dependencies

## Architecture

### AgentDocks Engine

The core agent loop executes tasks with the following flow:

1. **Receive** user query + optional files
2. **Create** a sandbox (E2B cloud OR local Docker container)
3. **Define** tools the AI can use: `bash`, `write`, `read`, `edit`, `glob`, `grep`
4. **Send** query + tool definitions to AI provider
5. **Execute** tool calls in sandbox and collect results
6. **Stream** every step to frontend as SSE events
7. **Repeat** until task is complete
8. **Cleanup** and destroy sandbox

## Tech Stack

### Frontend
- **Next.js** - React framework with App Router
- **React** - UI components
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### Backend
- **FastAPI** - Python web framework
- **Custom Agent Engine** - Built from scratch
- **Anthropic SDK** - Claude API integration
- **httpx** - HTTP client for OpenRouter/Ollama
- **E2B Code Interpreter** - Cloud sandbox execution
- **Docker SDK** - Local container management

### AI Providers
- **Anthropic** - Claude models (Opus, Sonnet, Haiku)
- **OpenRouter** - Access to 300+ models through one API
- **Ollama** - Run open-source models locally

### Sandbox Environments
- **E2B** - Fast, secure cloud-based code execution
- **Docker** - Run sandboxes locally on your machine

## Project Structure

```
agentdocks/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities and helpers
│   │   ├── hooks/     # Custom React hooks
│   │   └── types/     # TypeScript types
│   └── package.json
├── backend/            # FastAPI application
│   ├── app/
│   │   ├── main.py    # FastAPI entry point
│   │   └── api/       # API routes
│   │       ├── agent.py   # Agent execution endpoints
│   │       ├── config.py  # Configuration endpoints
│   │       └── health.py  # Health check endpoints
│   ├── core/          # AgentDocks Engine
│   │   ├── agent_runner.py    # Main agent loop
│   │   ├── providers.py       # AI provider abstraction
│   │   ├── sandbox.py         # Sandbox abstraction
│   │   ├── tools.py           # Tool definitions
│   │   ├── stream.py          # SSE streaming helpers
│   │   └── system_prompt.py   # Agent system prompt
│   ├── models/        # Pydantic models
│   │   └── schemas.py
│   └── requirements.txt
└── README.md
```

## Installation

Choose your preferred installation method:

### Option 1: One-Liner Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/LoFiTerminal/AgentDocks/main/scripts/install.sh | bash
```

Then run:
```bash
agentdocks
```

### Option 2: Docker

```bash
# Using docker-compose (recommended)
git clone https://github.com/LoFiTerminal/AgentDocks.git
cd AgentDocks
docker-compose up -d

# Or using Docker directly
docker run -d \
  -p 3000:3000 -p 8000:8000 \
  -v ~/.agentdocks:/root/.agentdocks \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/lofiterminal/agentdocks:latest
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: Manual Installation

**Prerequisites:**
- Node.js 18+ and npm
- Python 3.10+
- Docker (for local sandbox mode)

```bash
# Clone repository
git clone https://github.com/LoFiTerminal/AgentDocks.git
cd AgentDocks

# Install dependencies
make install

# Start both servers
make dev
```

**Alternative (without make):**

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open [http://localhost:3000](http://localhost:3000)

## Configuration

### AI Providers

- **Anthropic**: Requires API key from console.anthropic.com
- **OpenRouter**: Requires API key from openrouter.ai
- **Ollama**: Requires local Ollama installation

### Sandbox Options

- **E2B**: Cloud-based sandboxes (requires E2B API key from e2b.dev)
- **Docker**: Local Docker containers (requires Docker daemon)

## Agent Tools

The AI agent has access to these tools in the sandbox:

- **bash**: Execute shell commands
- **write**: Create or overwrite files
- **read**: Read file contents
- **edit**: Edit files with string replacement
- **glob**: List files matching a pattern
- **grep**: Search file contents for patterns

## API Endpoints

### Configuration
- `POST /api/config` - Save onboarding configuration
- `GET /api/config` - Get current configuration

### Agent Execution
- `POST /api/agent/run` - Run an agent task (SSE stream)
- `POST /api/agent/run-with-files` - Run agent with file uploads (SSE stream)

### Health
- `GET /` - API status
- `GET /health` - Health check

## SSE Event Types

The agent streams these events during execution:

- `status` - Status updates ("Creating sandbox...", etc.)
- `tool_use` - AI is using a tool
- `tool_result` - Tool execution result
- `text` - AI text response
- `file` - File was created/modified
- `error` - Error occurred
- `done` - Task complete, sandbox destroyed

## Development

### Quick Commands

```bash
make dev          # Start both servers in development mode
make build        # Production build
make docker       # Build Docker image
make docker-run   # Run Docker container
make clean        # Remove build artifacts
make lint         # Run linters
make test         # Run tests
make stop         # Stop all services
```

### Manual Development

```bash
# Run frontend
cd frontend && npm run dev

# Run backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload
```

## Deployment

### Docker Deployment

The easiest way to deploy AgentDocks:

```bash
docker-compose up -d
```

Configuration is persisted in `~/.agentdocks/`.

### Cloud Deployment

**Frontend (Vercel):**
1. Fork the repository on GitHub
2. Import to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `NEXT_PUBLIC_SITE_URL` - Your frontend URL
4. Deploy

**Backend (Railway/Fly.io/Any Docker host):**
1. Deploy from Docker image or source
2. Set environment variables:
   - `SITE_URL` - Your frontend URL
   - `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY` (optional)
   - `E2B_API_KEY` (optional, for cloud sandboxes)
3. Expose port 8000

**Shared Runs Cloud API (Optional):**

See [cloud-api/README.md](cloud-api/README.md) for deploying the shared runs service to Railway with Cloudflare R2 storage.

## Uninstall

```bash
# One-liner install users
curl -fsSL https://raw.githubusercontent.com/LoFiTerminal/AgentDocks/main/scripts/uninstall.sh | bash

# Manual uninstall
rm -rf ~/agentdocks
rm /usr/local/bin/agentdocks  # or ~/.local/bin/agentdocks
rm -rf ~/.agentdocks  # (optional) removes config and shared runs
```

## Documentation

- [Installation Guide](https://github.com/LoFiTerminal/AgentDocks#installation)
- [Configuration](https://github.com/LoFiTerminal/AgentDocks#configuration)
- [API Reference](https://github.com/LoFiTerminal/AgentDocks#api-endpoints)
- [Cloud API Deployment](cloud-api/README.md)

## License

MIT

## Contributing

**Contributions are welcome!** This is a fully open-source project with a custom-built agent engine.

We'd love your help making AgentDocks better. Here's how to contribute:

1. **Check existing issues**: Browse [GitHub Issues](https://github.com/LoFiTerminal/AgentDocks/issues) to see if your idea or bug is already reported
2. **Fork the repository**: [github.com/LoFiTerminal/AgentDocks](https://github.com/LoFiTerminal/AgentDocks)
3. **Create your feature branch**: `git checkout -b feature/amazing-feature`
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**: Submit your PR with a clear description of changes

### Ways to Contribute

- 🐛 **Report bugs**: Found an issue? [Open a bug report](https://github.com/LoFiTerminal/AgentDocks/issues/new)
- 💡 **Suggest features**: Have an idea? [Open a feature request](https://github.com/LoFiTerminal/AgentDocks/issues/new)
- 📝 **Improve docs**: Documentation improvements are always appreciated
- 🧪 **Add tests**: Help us increase code coverage
- 🎨 **UI/UX improvements**: Make the interface even better
- 🔧 **Code contributions**: Fix bugs, add features, optimize performance

## Support

- 🐛 [Report a Bug](https://github.com/LoFiTerminal/AgentDocks/issues)
- 💡 [Request a Feature](https://github.com/LoFiTerminal/AgentDocks/issues)
- 💬 [Discussions](https://github.com/LoFiTerminal/AgentDocks/discussions)
- ⭐ [Star on GitHub](https://github.com/LoFiTerminal/AgentDocks)

## Credits

Built by the AgentDocks team as a fully self-contained, privacy-first agent execution platform.

**Repository:** [github.com/LoFiTerminal/AgentDocks](https://github.com/LoFiTerminal/AgentDocks)
