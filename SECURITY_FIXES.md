# CRITICAL SECURITY FIXES - IMPLEMENTATION GUIDE

## Priority 1: Command Injection Fixes (IMMEDIATE)

### Fix 1: Add shlex.quote() to all shell commands

**File: backend/core/agent_runner.py**

```python
# Add import at top
import shlex

# Line 313 - glob tool
elif tool_name == "glob":
    pattern = tool_input["pattern"]
    directory = tool_input.get("directory", ".")

    # FIXED: Use shlex.quote()
    stdout, _, _ = await sandbox.execute_bash(
        f"find {shlex.quote(directory)} -name {shlex.quote(pattern)} 2>/dev/null"
    )
    files = [f.strip() for f in stdout.split('\n') if f.strip()]
    return {"files": files}

# Line 324 - grep tool
elif tool_name == "grep":
    pattern = tool_input["pattern"]
    path = tool_input.get("path", ".")

    # FIXED: Use shlex.quote()
    stdout, _, exit_code = await sandbox.execute_bash(
        f"grep -r {shlex.quote(pattern)} {shlex.quote(path)} 2>/dev/null || true"
    )
    return {"matches": stdout}
```

### Fix 2: Escape paths in sandbox.py

**File: backend/core/sandbox.py**

```python
# Add import at top
import shlex

# Line 142 (E2B) - list_files
async def list_files(self, directory: str = ".") -> List[str]:
    if not self.sandbox:
        raise RuntimeError("Sandbox not initialized")

    # FIXED: Use shlex.quote()
    stdout, _, _ = await self.execute_bash(f"ls -1 {shlex.quote(directory)}")
    return [f for f in stdout.split('\n') if f.strip()]

# Line 222 - list_directory_recursive
async def list_directory_recursive(self, path: str) -> List[Dict[str, Any]]:
    if not self.sandbox:
        raise RuntimeError("Sandbox not initialized")

    # FIXED: Use shlex.quote()
    stdout, _, _ = await self.execute_bash(
        f"find {shlex.quote(path)} -type f -o -type d | head -1000"
    )

    files = []
    for line in stdout.strip().split('\n'):
        if not line:
            continue

        # CRITICAL FIX: Quote the line from find output
        line_quoted = shlex.quote(line)

        # Check if file or directory
        type_stdout, _, _ = await self.execute_bash(
            f"test -f {line_quoted} && echo 'file' || echo 'dir'"
        )
        item_type = type_stdout.strip()

        # Get size if file
        size = 0
        if item_type == 'file':
            size_stdout, _, _ = await self.execute_bash(
                f"stat -f%z {line_quoted} 2>/dev/null || stat -c%s {line_quoted} 2>/dev/null"
            )
            try:
                size = int(size_stdout.strip())
            except:
                pass

        files.append({
            'path': line,
            'type': item_type,
            'size': size
        })

    return files

# Line 257 - get_file_hash
async def get_file_hash(self, path: str) -> str:
    if not self.sandbox:
        raise RuntimeError("Sandbox not initialized")

    # FIXED: Use shlex.quote()
    stdout, _, exit_code = await self.execute_bash(
        f"sha256sum {shlex.quote(path)} 2>/dev/null || shasum -a 256 {shlex.quote(path)} 2>/dev/null"
    )

    if exit_code != 0:
        return ""

    # Parse hash from output
    parts = stdout.strip().split()
    if parts:
        return parts[0]
    return ""

# Line 203-206 - copy_directory base64 command
# Inside copy_directory method where binary files are written:
try:
    with open(file_path, 'rb') as f:
        content_bytes = f.read()

    try:
        content_str = content_bytes.decode('utf-8')
        await self.sandbox.files.write(dest_path, content_str)
    except UnicodeDecodeError:
        # FIXED: Quote both b64_content and dest_path
        b64_content = base64.b64encode(content_bytes).decode('ascii')
        dest_dir = str(Path(dest_path).parent)

        # FIXED: Use shlex.quote for paths
        await self.sandbox.run_code(
            f"mkdir -p {shlex.quote(dest_dir)}",
            language="bash"
        )
        await self.sandbox.run_code(
            f"echo {shlex.quote(b64_content)} | base64 -d > {shlex.quote(dest_path)}",
            language="bash"
        )
except Exception as e:
    print(f"Warning: Failed to copy {rel_path}: {e}")
    continue

# Line 301 - Docker execute_bash
async def execute_bash(self, command: str) -> Tuple[str, str, int]:
    if not self.container:
        raise RuntimeError("Container not initialized")

    # IMPORTANT NOTE: Don't use shlex.quote here as 'command' is the full command
    # Instead, ensure the caller properly escapes arguments before building 'command'

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: self.container.exec_run(
            # Use single quotes and escape single quotes in command
            f"/bin/bash -c '{command.replace(chr(39), chr(39) + chr(92) + chr(39) + chr(39))}'",
            workdir="/workspace"
        )
    )

    exit_code = result.exit_code
    output = result.output.decode('utf-8', errors='replace')

    # Split stdout and stderr (if possible)
    return output, "", exit_code
```

## Priority 2: API Key Security (SAME DAY)

### Fix 3: Set secure file permissions on config

**File: backend/app/config.py**

```python
import os
from pathlib import Path

CONFIG_FILE = Path.home() / ".agentdocks" / "config.json"

def save_config(config: OnboardingConfig) -> OnboardingConfig:
    """Save configuration to storage."""
    global _config_storage
    _config_storage = config

    # Persist to disk
    try:
        CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)

        with open(CONFIG_FILE, 'w') as f:
            json.dump(config.model_dump(), f, indent=2)

        # ADDED: Set secure permissions (owner read/write only)
        os.chmod(CONFIG_FILE, 0o600)

        return config
    except Exception as e:
        raise Exception(f"Failed to save config: {str(e)}")
```

## Priority 3: Input Validation (NEXT SPRINT)

### Fix 4: File upload validation

**File: frontend/src/components/agent/InputBar.tsx**

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 20;

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const newFiles = Array.from(e.target.files);

  // Validate individual file sizes
  const oversizedFiles = newFiles.filter(f => f.size > MAX_FILE_SIZE);
  if (oversizedFiles.length > 0) {
    alert(`Some files are too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
    return;
  }

  // Validate total files count
  if (files.length + newFiles.length > MAX_FILES) {
    alert(`Too many files (max ${MAX_FILES})`);
    return;
  }

  // Validate total size
  const currentSize = files.reduce((sum, f) => sum + f.size, 0);
  const newSize = newFiles.reduce((sum, f) => sum + f.size, 0);
  if (currentSize + newSize > MAX_TOTAL_SIZE) {
    alert(`Total file size too large (max ${MAX_TOTAL_SIZE / 1024 / 1024}MB)`);
    return;
  }

  setFiles(prev => [...prev, ...newFiles]);
};
```

### Fix 5: Add CSRF protection

**File: backend/app/main.py**

```python
from fastapi.middleware.csrf import CSRFProtect
from fastapi.responses import JSONResponse

# Add CSRF middleware
@app.middleware("http")
async def csrf_middleware(request: Request, call_next):
    # For local development, CSRF is less critical
    # But for production deployment, implement CSRF tokens

    # Simple SameSite cookie approach:
    response = await call_next(request)

    # Set SameSite=Strict on all cookies
    if 'set-cookie' in response.headers:
        response.headers['set-cookie'] += '; SameSite=Strict'

    return response
```

## Testing the Fixes

### Test Command Injection Fixes

```bash
# Test 1: Glob with injection attempt
curl -X POST http://localhost:8000/api/agent/run \
  -H 'Content-Type: application/json' \
  -d '{"query": "Find files with pattern \"; rm -rf /; echo \"", "max_turns": 2}'

# Expected: Should fail gracefully or find no files, NOT execute rm command

# Test 2: Grep with injection attempt
curl -X POST http://localhost:8000/api/agent/run \
  -H 'Content-Type: application/json' \
  -d '{"query": "Search for pattern \"'\'''; cat /etc/passwd; #'\''\" in files", "max_turns": 2}'

# Expected: Should search for literal string, NOT cat /etc/passwd
```

### Test API Key Permissions

```bash
# Check config file permissions
ls -la ~/.agentdocks/config.json

# Expected output: -rw------- (600 permissions)
# NOT: -rw-r--r-- (644 permissions)
```

## Deployment Checklist

- [ ] Apply all shlex.quote() fixes to agent_runner.py
- [ ] Apply all shlex.quote() fixes to sandbox.py
- [ ] Add os.chmod(CONFIG_FILE, 0o600) to config.py
- [ ] Add file upload validation to InputBar.tsx
- [ ] Test command injection prevention
- [ ] Test file permissions on config.json
- [ ] Run full test suite
- [ ] Update security documentation
- [ ] Notify users of security update

## After Deployment

1. Delete existing config.json and recreate to get secure permissions
2. Restart both backend and frontend
3. Verify file permissions: `ls -la ~/.agentdocks/`
4. Test agent functionality with various inputs
5. Monitor logs for any injection attempts
