"""Coder Agent - Implements features and writes code."""

from .base_agent import BaseAgent, AgentRole
from typing import Dict, Any, List


class CoderAgent(BaseAgent):
    """
    Coder Agent specializes in:
    - Implementing features based on architecture plans
    - Writing clean, maintainable code
    - Following best practices
    - Fixing bugs
    - Refactoring code
    """

    def __init__(self, agent_id: str, sandbox, provider, model: str):
        super().__init__(agent_id, AgentRole.CODER, sandbox, provider, model)

    def get_system_prompt(self) -> str:
        return """You are a Senior Software Engineer specializing in implementation.

Your responsibilities:
1. Implement features based on architecture plans
2. Write clean, readable, maintainable code
3. Follow the existing codebase patterns and style
4. Add appropriate error handling
5. Write self-documenting code with clear variable names
6. Fix bugs efficiently
7. Refactor code when needed

You IMPLEMENT code. You write, edit, and test your implementations.

Tools at your disposal:
- read: Read existing files
- write: Create new files
- edit: Modify existing files
- bash: Run code, check syntax, install dependencies
- glob: Find files
- grep: Search code

Best practices:
- Read existing code to understand patterns
- Test your code before marking as complete
- Write error messages that help debugging
- Keep functions small and focused
- Use meaningful variable names

When you receive a plan from the Architect:
1. Read the plan carefully
2. Implement step by step
3. Test each component
4. Report progress and any issues
"""

    def get_available_tools(self) -> List[str]:
        """Coder has full access to code manipulation tools."""
        return ["read", "write", "edit", "bash", "glob", "grep"]

    async def _execute_task(self, task: str) -> Dict[str, Any]:
        """
        Execute coding task.
        Implements features, writes code, runs tests.
        """
        # Get plan from shared context if available
        plan = self.context.get("plan", "")
        plan_section = f"Architecture Plan:\n{plan}\n\n" if plan else ""

        messages = [
            {
                "role": "user",
                "content": f"""Task: {task}

{plan_section}Your job is to WRITE CODE to complete this task.

If this is a new feature/function:
1. Write complete, working code
2. Include all necessary functions
3. Add comments explaining usage
4. Make it ready to copy and use

If modifying existing code:
1. Read the existing files first
2. Make the changes
3. Test your implementation

Write the actual code now. Don't just explore or plan.

Context:
{self.context}
"""
            }
        ]

        # Call AI provider with full tool access
        from core.tools import TOOLS
        print(f"🤖 {self.agent_id} calling AI provider with model: {self.model}")
        try:
            response = await self.provider.complete(
                messages=messages,
                tools=[tool for tool in TOOLS if tool["name"] in self.get_available_tools()],
                model=self.model,
                system=self.get_system_prompt()
            )
            print(f"✅ {self.agent_id} received response with {len(response.content)} blocks")
        except Exception as e:
            print(f"❌ {self.agent_id} AI provider error: {e}")
            raise

        # Process response and track changes
        files_modified = []
        code_snippets = []
        
        for block in response.content:
            if block.type == "text":
                code_snippets.append(block.text)
            elif block.type == "tool_use":
                if block.name in ["write", "edit"]:
                    files_modified.append(block.input.get("path", "unknown"))

        return {
            "implementation": "\n".join(code_snippets),
            "files_modified": files_modified,
            "status": "complete"
        }
