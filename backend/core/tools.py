"""Tool definitions for the AI agent in Anthropic's tool format."""

TOOLS = [
    {
        "name": "bash",
        "description": "Execute a bash command in the sandbox. Returns stdout, stderr, and exit code.",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "The bash command to execute"
                }
            },
            "required": ["command"]
        }
    },
    {
        "name": "write",
        "description": "Create or overwrite a file with the given content.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "The file path (relative to sandbox root)"
                },
                "content": {
                    "type": "string",
                    "description": "The file content"
                }
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "read",
        "description": "Read the contents of a file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "The file path to read"
                }
            },
            "required": ["path"]
        }
    },
    {
        "name": "edit",
        "description": "Edit a file by replacing old_text with new_text. Use for precise modifications.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "The file path to edit"
                },
                "old_text": {
                    "type": "string",
                    "description": "The exact text to replace"
                },
                "new_text": {
                    "type": "string",
                    "description": "The new text to insert"
                }
            },
            "required": ["path", "old_text", "new_text"]
        }
    },
    {
        "name": "glob",
        "description": "List files matching a glob pattern (e.g., '*.py', 'src/**/*.js').",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "The glob pattern to match"
                },
                "directory": {
                    "type": "string",
                    "description": "The directory to search in (default: '.')",
                    "default": "."
                }
            },
            "required": ["pattern"]
        }
    },
    {
        "name": "grep",
        "description": "Search for a pattern in files. Returns matching lines.",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "The text pattern to search for"
                },
                "path": {
                    "type": "string",
                    "description": "File or directory to search in",
                    "default": "."
                }
            },
            "required": ["pattern"]
        }
    }
]
