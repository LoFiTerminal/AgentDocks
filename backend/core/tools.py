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
    },
    {
        "name": "browser",
        "description": "Control a headless browser for web automation. Supports navigation, interaction, screenshots, and data extraction. Actions: navigate (go to URL), click (click element by CSS selector), type (type text into input), screenshot (capture page image), extract (get text from elements), wait (wait for element), execute (run JavaScript), close (close browser).",
        "input_schema": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["navigate", "click", "type", "screenshot", "extract", "wait", "execute", "close"],
                    "description": "The browser action to perform"
                },
                "url": {
                    "type": "string",
                    "description": "URL to navigate to (required for 'navigate', optional for 'screenshot' to navigate first)"
                },
                "selector": {
                    "type": "string",
                    "description": "CSS selector for element (required for 'click', 'type', 'extract', 'wait' actions)"
                },
                "text": {
                    "type": "string",
                    "description": "Text to type (required for 'type' action)"
                },
                "javascript": {
                    "type": "string",
                    "description": "JavaScript code to execute (required for 'execute' action)"
                },
                "full_page": {
                    "type": "boolean",
                    "description": "Capture full page screenshot (optional for 'screenshot' action, default: false)",
                    "default": False
                },
                "timeout": {
                    "type": "integer",
                    "description": "Timeout in milliseconds (default: 30000)",
                    "default": 30000
                }
            },
            "required": ["action"]
        }
    }
]
