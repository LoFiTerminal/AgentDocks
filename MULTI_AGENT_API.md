# Multi-Agent System API Documentation

The Multi-Agent API enables coordinated workflows with specialized agents working together to complete complex tasks.

## Architecture

The multi-agent system consists of:

- **Orchestrator**: Coordinates agent execution and manages workflows
- **Architect Agent**: Plans system design and architecture
- **Coder Agent**: Implements features and writes code
- **Tester Agent**: Writes and runs comprehensive tests
- **Reviewer Agent**: Reviews code quality and approves changes

## API Endpoints

### 1. Execute Multi-Agent Workflow

**POST /api/multi-agent/run**

Execute a workflow with multiple specialized agents.

**Request Body:**
```json
{
  "task": "Add user authentication to the API",
  "workflow": "feature",  // "feature" | "debug" | "refactor"
  "context": {},  // Optional context data
  "model": "claude-sonnet-4"  // Optional, overrides config
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"type": "status", "data": {"message": "Starting feature workflow..."}}

data: {"type": "result", "data": {"task": "...", "success": true, "steps": [...]}}

data: {"type": "done", "data": {"success": true}}
```

**Example:**
```javascript
const response = await fetch('/api/multi-agent/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: 'Add user authentication',
    workflow: 'feature'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));
      console.log(event.type, event.data);
    }
  }
}
```

---

### 2. Get Agent Status

**GET /api/multi-agent/status**

Get current status of all active agents.

**Response:**
```json
{
  "agents": [
    {
      "agent_id": "architect_1",
      "role": "architect",
      "status": "working",
      "current_task": "Planning authentication system",
      "progress": "Analyzing requirements"
    },
    {
      "agent_id": "coder_1",
      "role": "coder",
      "status": "waiting",
      "current_task": null,
      "progress": null
    }
  ],
  "total_agents": 4,
  "active_agents": 1
}
```

**Agent Status Values:**
- `idle`: Agent is ready but not assigned
- `thinking`: Agent is processing information
- `working`: Agent is actively executing tasks
- `waiting`: Agent is waiting for dependencies
- `done`: Agent has completed its task
- `error`: Agent encountered an error

---

### 3. Get Inter-Agent Messages

**GET /api/multi-agent/messages**

Get communication history between agents.

**Response:**
```json
{
  "messages": [
    {
      "from_agent": "architect_1",
      "to_agent": "coder_1",
      "message_type": "plan_complete",
      "content": {
        "plan": "Implementation plan...",
        "files": ["src/auth/login.py", "src/auth/register.py"]
      },
      "timestamp": "2024-02-16T21:30:00.000Z"
    }
  ],
  "total_messages": 12
}
```

**Message Types:**
- `plan_complete`: Architecture plan finished
- `implementation_complete`: Code implementation done
- `test_results`: Test execution results
- `review_complete`: Code review finished
- `request_info`: Agent requesting information
- `error`: Agent reporting an error

---

### 4. Get Shared Context

**GET /api/multi-agent/context**

Get shared context data between agents.

**Response:**
```json
{
  "data": {
    "plan": "Detailed implementation plan...",
    "files_to_modify": ["src/auth.py", "tests/test_auth.py"],
    "test_results": {
      "tests_passed": 15,
      "tests_failed": 0
    },
    "code_review": {
      "decision": "APPROVED",
      "issues": []
    }
  }
}
```

---

### 5. Reset Multi-Agent System

**POST /api/multi-agent/reset**

Reset the multi-agent system (clear all agents and state).

**Response:**
```json
{
  "success": true,
  "message": "Multi-agent system reset"
}
```

---

### 6. Get Available Workflows

**GET /api/multi-agent/workflows**

List all available multi-agent workflows.

**Response:**
```json
{
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
```

---

## Workflows

### Feature Development Workflow

**Flow:** Architect → Coder → Tester → Reviewer

1. **Architect Agent**
   - Analyzes requirements
   - Creates implementation plan
   - Designs architecture
   - Identifies files to modify

2. **Coder Agent**
   - Reads the plan
   - Implements the feature
   - Writes clean code
   - Reports files modified

3. **Tester Agent**
   - Reads implementation
   - Writes comprehensive tests
   - Runs test suite
   - Reports results

4. **Reviewer Agent**
   - Reviews code quality
   - Checks security
   - Assesses performance
   - Approves or requests changes

**Result:** `APPROVED` / `CHANGES_REQUESTED` / `REJECTED`

---

### Debug Workflow

**Flow:** Coder (investigate) → Tester (reproduce) → Coder (fix) → Tester (verify)

1. Investigate the bug
2. Write tests that reproduce the issue
3. Fix the bug
4. Verify with tests

---

### Refactor Workflow

**Flow:** Architect (plan) → Coder (refactor) → Tester (verify) → Reviewer (approve)

1. Plan refactoring approach
2. Implement refactoring
3. Ensure tests pass
4. Review changes

---

## Frontend Integration Example

```typescript
// Multi-Agent Dashboard Component
import { useState, useEffect } from 'react';

export function MultiAgentDashboard() {
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);

  // Poll for agent status
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('/api/multi-agent/status');
      const data = await response.json();
      setAgents(data.agents);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Run a workflow
  const runWorkflow = async (task: string, workflow: string) => {
    const response = await fetch('/api/multi-agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, workflow })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      // Process SSE events...
    }
  };

  return (
    <div>
      <h2>Multi-Agent System</h2>

      {/* Agent Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        {agents.map(agent => (
          <AgentCard key={agent.agent_id} agent={agent} />
        ))}
      </div>

      {/* Message Timeline */}
      <MessageTimeline messages={messages} />

      {/* Workflow Trigger */}
      <button onClick={() => runWorkflow('Add auth', 'feature')}>
        Start Feature Workflow
      </button>
    </div>
  );
}
```

---

## Error Handling

All endpoints may return errors in the SSE stream or as HTTP errors:

```json
{
  "type": "error",
  "data": {
    "message": "Invalid API key. Please check your configuration."
  }
}
```

**Common Errors:**
- `400 Bad Request`: Configuration missing or invalid
- `500 Internal Server Error`: Orchestrator or agent failure
- API key errors: Invalid or missing provider API keys
- Sandbox errors: Sandbox creation or execution failures

---

## Best Practices

1. **Polling Interval**: Poll `/status` and `/messages` every 2-3 seconds during active workflows
2. **SSE Handling**: Always handle SSE stream disconnections and reconnect
3. **Error Recovery**: Reset the system (`POST /reset`) if agents get stuck
4. **Context Management**: Use shared context to pass data between agents
5. **Workflow Selection**: Choose the right workflow for the task:
   - New features → `feature` workflow
   - Bug fixes → `debug` workflow
   - Code cleanup → `refactor` workflow

---

## Next Steps

The multi-agent API is now fully functional. Next phases:

1. **Frontend UI**: Create multi-agent dashboard with agent cards, message timeline, and workflow controls
2. **Real-time Updates**: Implement WebSocket for real-time agent status updates (instead of polling)
3. **Workflow Customization**: Allow users to define custom workflows
4. **Agent Chat**: Enable users to communicate directly with individual agents
5. **Performance Monitoring**: Track workflow execution time and success rates
