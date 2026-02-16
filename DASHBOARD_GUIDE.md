# AgentDocks Dashboard Guide

## Overview

The AgentDocks dashboard is the main interface where users interact with AI agents after completing onboarding. It features real-time streaming of agent execution with full visibility into every step.

## Components Built

### 1. Dashboard Page (`/dashboard`)

**Location**: `frontend/src/app/dashboard/page.tsx`

Main orchestration component that:
- Manages task history state
- Loads user configuration from API
- Handles agent submission
- Coordinates between sidebar, console, and input bar

### 2. useAgent Hook

**Location**: `frontend/src/hooks/useAgent.ts`

Custom React hook for SSE streaming:

```typescript
const { messages, isRunning, error, runAgent, stopAgent, clearMessages } = useAgent();
```

**Features**:
- Connects to `/api/agent/run` or `/api/agent/run-with-files`
- Uses Fetch API with ReadableStream for SSE
- Parses `data: {...}` formatted events
- Maintains message array with proper TypeScript types
- Handles abort/cancellation
- Graceful error handling with retry support

**Message Types**:
```typescript
interface AgentMessage {
  id: string;
  type: 'status' | 'tool_use' | 'tool_result' | 'text' | 'file' | 'error' | 'done';
  data: any;
  timestamp: number;
}
```

### 3. Sidebar Component

**Location**: `frontend/src/components/agent/Sidebar.tsx`

Left sidebar with:
- **Logo**: AgentDocks logo with glow effect
- **New Task Button**: Amber button to clear console and start fresh
- **Task History**: Last 10 tasks with timestamps
- **Settings Section**: Shows current model + sandbox config
- **Settings Button**: Links to `/onboarding` for reconfiguration

### 4. AgentConsole Component

**Location**: `frontend/src/components/agent/AgentConsole.tsx`

Main content area with two states:

**Empty State**:
- Centered sparkle icon
- "Tell the agent what to do" heading
- Three clickable example prompts:
  - "Analyze this CSV and make a chart"
  - "Build a Python web scraper"
  - "Create a React landing page"

**Active State**:
- Scrollable message list
- Auto-scrolls to bottom on new messages
- Renders each message with `MessageItem`

### 5. MessageItem Component

**Location**: `frontend/src/components/agent/MessageItem.tsx`

Renders different event types:

| Event Type | Visual | Content |
|------------|--------|---------|
| `status` | Gray text + pulsing amber dot | Status message |
| `tool_use` | Purple badge + Terminal icon | Tool name + JSON input |
| `tool_result` | Green/Red icon | Code block with output |
| `text` | 🤖 emoji + amber icon | AI response text |
| `file` | Blue FileText icon | File path + size + download button |
| `error` | Red AlertCircle icon | Error message in red box |
| `done` | Green CheckCircle | Success banner |

### 6. InputBar Component

**Location**: `frontend/src/components/agent/InputBar.tsx`

Bottom input area with:
- **File Upload**: Paperclip button opens file picker
- **File Chips**: Shows selected files with X to remove
- **Text Input**: Expandable textarea (Enter to submit, Shift+Enter for newline)
- **Run Button**: Amber button with lightning icon
- **Stop Button**: Red button when agent is running
- **Disabled State**: All inputs disabled while running

## Design System

### Colors
- **Background**: `#1C1917` (dark)
- **Accent**: `#F59E0B` (amber)
- **Success**: Green (`#10B981`)
- **Error**: Red (`#EF4444`)
- **Tool Use**: Purple (`#A855F7`)
- **File**: Blue (`#3B82F6`)

### Typography
- **Sans Serif**: Inter (body text)
- **Monospace**: JetBrains Mono (code, tool names, model/sandbox)

### Animations
```css
.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## User Flow

### First Visit (After Onboarding)

1. User completes onboarding → redirected to `/dashboard`
2. Sees empty state with example prompts
3. Clicks example or types custom query
4. Agent streams live output
5. Task appears in sidebar history

### Running an Agent

**Simple Query**:
```
User types: "Create a Python script that prints hello world"
Click "Run"
```

**With Files**:
```
User types: "Analyze this CSV and make a chart"
Click paperclip → select data.csv
Click "Run"
```

### Message Flow Example

```
1. STATUS: "Creating docker sandbox..."
   ↓
2. STATUS: "Sandbox ready!"
   ↓
3. TEXT: "I'll create a Python script for you."
   ↓
4. TOOL_USE: bash {"command": "touch hello.py"}
   ↓
5. TOOL_RESULT: {"stdout": "", "exit_code": 0}
   ↓
6. TOOL_USE: write {"path": "hello.py", "content": "print('Hello world')"}
   ↓
7. TOOL_RESULT: {"success": true}
   ↓
8. TOOL_USE: bash {"command": "python hello.py"}
   ↓
9. TOOL_RESULT: {"stdout": "Hello world\n", "exit_code": 0}
   ↓
10. TEXT: "Done! The script prints 'Hello world'."
    ↓
11. DONE: "Task complete. Sandbox destroyed."
```

## SSE Protocol

### Request
```typescript
POST /api/agent/run
Content-Type: application/json

{
  "query": "Create a Python script",
  "max_turns": 10
}
```

### Response
```
HTTP/1.1 200 OK
Content-Type: text/event-stream

data: {"type": "status", "data": {"message": "Creating sandbox..."}}

data: {"type": "tool_use", "data": {"tool": "bash", "input": {...}}}

data: {"type": "tool_result", "data": {"result": {...}, "is_error": false}}

data: {"type": "text", "data": {"content": "I've completed..."}}

data: {"type": "done", "data": {"message": "Task complete."}}
```

## Error Handling

### Network Errors
- Hook catches fetch errors
- Displays error message in console
- Allows retry

### Backend Errors
- Backend sends `{"type": "error", "data": {"message": "..."}}`
- Displayed as red error box
- Agent continues if recoverable

### Abort/Stop
- User clicks "Stop" button
- AbortController cancels fetch
- Reader closed gracefully
- UI updates to idle state

## Future Enhancements

- [ ] **Session Persistence**: Save tasks to localStorage or database
- [ ] **File Downloads**: Download files created by agents
- [ ] **Code Syntax Highlighting**: Highlight code blocks
- [ ] **Copy to Clipboard**: Copy tool results
- [ ] **Streaming Text**: Stream AI text word-by-word
- [ ] **Agent Metrics**: Show execution time, token usage
- [ ] **Multi-Session**: Support multiple concurrent agents
- [ ] **Export Chat**: Download full conversation as JSON/Markdown
- [ ] **Dark/Light Mode Toggle**: Theme switcher

## Testing the Dashboard

### 1. Complete Onboarding
```bash
# Visit http://localhost:3000/onboarding
# Configure Anthropic, OpenRouter, or Ollama
# Choose E2B or Docker
# Complete setup
```

### 2. Test Simple Query
```
Query: "Write a Python script that counts to 10"
Expected: Agent creates file, runs it, shows output
```

### 3. Test with Files
```
Upload: test.txt (with some text)
Query: "Count the words in the uploaded file"
Expected: Agent reads file, counts words, reports result
```

### 4. Test Error Handling
```
Query: "Run a command that doesn't exist: foobar123"
Expected: Error shown, agent recovers
```

### 5. Test Stop
```
Query: "Install tensorflow and train a neural network"
Click "Stop" after a few seconds
Expected: Agent stops gracefully
```

## Troubleshooting

### Agent Not Starting
- Check backend is running: `http://localhost:8000/health`
- Check config exists: `http://localhost:8000/api/config`
- Check browser console for errors

### No Messages Appearing
- Open Network tab, check SSE connection
- Look for `/api/agent/run` request
- Check response is `text/event-stream`

### Files Not Uploading
- Check file size (backend may have limits)
- Check backend supports multipart/form-data
- Check network tab for upload progress

### Sandbox Errors
- **E2B**: Verify API key is valid
- **Docker**: Verify Docker daemon is running
- Check backend logs for sandbox creation errors
