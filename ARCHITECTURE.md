# AgentDocks Engine Architecture

## Overview

AgentDocks is built with a **custom agent execution engine** from scratch, with zero external agent framework dependencies. The engine orchestrates AI agents that can execute code in disposable sandboxes.

## Core Components

### 1. Agent Runner (`core/agent_runner.py`)

The heart of AgentDocks. Implements the core agent loop:

```python
1. Receive user query + optional files
2. Create sandbox (E2B or Docker)
3. Send query + tool definitions to AI provider
4. AI responds with text and/or tool calls
5. Execute tool calls in sandbox
6. Send results back to AI
7. Repeat until task complete
8. Destroy sandbox
9. Stream everything as SSE events
```

**Key Method**: `AgentRunner.run()` - Returns async generator yielding SSE events

### 2. Provider Abstraction (`core/providers.py`)

Abstract base class with three implementations:

- **AnthropicProvider**: Uses official `anthropic` SDK
- **OpenRouterProvider**: HTTP client using `httpx`
- **OllamaProvider**: HTTP client for local Ollama

**Interface**:
```python
async def complete(messages, tools, model, system) -> response
```

### 3. Sandbox Abstraction (`core/sandbox.py`)

Abstract base class with two implementations:

- **E2BSandbox**: Cloud-based via `e2b-code-interpreter`
- **DockerSandbox**: Local containers via `docker` SDK

**Interface**:
```python
async def execute_bash(command) -> (stdout, stderr, exit_code)
async def write_file(path, content) -> success
async def read_file(path) -> content
async def list_files(directory) -> files
async def upload_file(name, content) -> path
async def download_file(path) -> bytes
async def destroy() -> None
```

### 4. Tool Definitions (`core/tools.py`)

Six tools available to AI agents:

| Tool | Description | Input Schema |
|------|-------------|--------------|
| `bash` | Execute shell commands | `{command: string}` |
| `write` | Create/overwrite files | `{path: string, content: string}` |
| `read` | Read file contents | `{path: string}` |
| `edit` | String replacement in files | `{path: string, old_text: string, new_text: string}` |
| `glob` | List files by pattern | `{pattern: string, directory?: string}` |
| `grep` | Search file contents | `{pattern: string, path?: string}` |

### 5. SSE Streaming (`core/stream.py`)

Server-Sent Events for real-time updates:

```python
- stream_status(message) -> Status update
- stream_tool_use(tool, input) -> AI using tool
- stream_tool_result(result, is_error) -> Tool result
- stream_text(content) -> AI text response
- stream_file(path, size) -> File created
- stream_error(message) -> Error occurred
- stream_done(message) -> Task complete
```

### 6. System Prompt (`core/system_prompt.py`)

Comprehensive instructions for the AI agent explaining:
- Available tools and their purpose
- Best practices for task execution
- Error handling guidelines
- Expected behavior

## API Endpoints

### Agent Execution

**POST /api/agent/run**
```json
{
  "query": "Create a Python script that prints hello world",
  "model": "claude-sonnet-4-5-20250929",
  "max_turns": 10,
  "timeout": 300
}
```
Returns: SSE stream

**POST /api/agent/run-with-files**
- Multipart form data with files
- Query string
- Model selection
Returns: SSE stream

### Configuration

**POST /api/config**
```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "model": "claude-sonnet-4-5-20250929",
  "sandbox": "docker",
  "e2bApiKey": ""
}
```

**GET /api/config**
Returns current configuration

### Health

**GET /**
Returns API status with engine info

**GET /health**
Returns health check

## Data Flow

```
User Query
    ↓
Frontend (/api/agent/run)
    ↓
AgentRunner
    ↓
    ├─→ Provider (Anthropic/OpenRouter/Ollama)
    │       ↓
    │   AI Response (text + tool calls)
    │       ↓
    └─→ Sandbox (E2B/Docker)
            ↓
        Execute tools
            ↓
        Return results
            ↓
    Stream events to Frontend (SSE)
```

## Event Types (SSE)

```javascript
// Status updates
{"type": "status", "data": {"message": "Creating sandbox..."}}

// AI using a tool
{"type": "tool_use", "data": {"tool": "bash", "input": {"command": "ls"}}}

// Tool execution result
{"type": "tool_result", "data": {"result": {...}, "is_error": false}}

// AI text response
{"type": "text", "data": {"content": "I've created the file..."}}

// File operations
{"type": "file", "data": {"path": "output.txt", "size": 1024}}

// Errors
{"type": "error", "data": {"message": "Something went wrong"}}

// Task complete
{"type": "done", "data": {"message": "Task complete. Sandbox destroyed."}}
```

## Security

- **Sandboxed Execution**: All code runs in isolated containers
- **Ephemeral Environments**: Sandboxes are destroyed after each task
- **Local-First**: API keys never leave the user's machine
- **No Data Collection**: Zero telemetry or external data sharing

## Extension Points

### Adding a New Provider

1. Create class extending `BaseProvider`
2. Implement `async def complete(...)`
3. Convert response to Anthropic format
4. Add to `create_provider()` factory

### Adding a New Sandbox

1. Create class extending `BaseSandbox`
2. Implement all abstract methods
3. Add to `create_sandbox()` factory

### Adding a New Tool

1. Add tool definition to `TOOLS` array in `core/tools.py`
2. Add tool execution logic to `AgentRunner._execute_tool()`

## Performance Considerations

- **Async/Await**: All I/O operations are async
- **Streaming**: Events streamed as they occur (no buffering)
- **Sandbox Pooling**: Future: reuse containers for speed
- **Provider Batching**: Future: batch multiple tool calls

## Future Enhancements

- [ ] Persistent sandbox sessions
- [ ] Multi-file context awareness
- [ ] Agent memory across sessions
- [ ] Collaborative multi-agent workflows
- [ ] Visual output rendering (charts, images)
- [ ] Workspace persistence between runs
- [ ] Agent marketplace (share prompts/workflows)
