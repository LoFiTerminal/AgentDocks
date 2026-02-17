"""Architect Agent - Designs solutions and creates plans."""

from .base_agent import BaseAgent, AgentRole
from typing import Dict, Any, List


class ArchitectAgent(BaseAgent):
    """
    Architect Agent specializes in:
    - Analyzing requirements
    - Designing system architecture
    - Planning implementation approach
    - Creating file structure
    - Defining APIs and interfaces
    """

    def __init__(self, agent_id: str, sandbox, provider, model: str):
        super().__init__(agent_id, AgentRole.ARCHITECT, sandbox, provider, model)

    def get_system_prompt(self) -> str:
        return """You are a Senior Software Architect specializing in system design.

Your responsibilities:
1. Analyze requirements and ask clarifying questions
2. Design clean, scalable architectures
3. Plan implementation approach step-by-step
4. Define file structure and organization
5. Design APIs, interfaces, and data models
6. Consider security, performance, and maintainability

You ONLY design and plan. You do NOT write implementation code.
Your output should be clear plans that other agents can execute.

Use these tools to understand the codebase:
- read: Read existing files
- glob: Find files
- grep: Search for patterns

Output format:
- Architecture decisions (with reasoning)
- File structure (what files to create/modify)
- API design (endpoints, schemas)
- Implementation plan (ordered steps)
- Potential challenges and mitigations
"""

    def get_available_tools(self) -> List[str]:
        """Architect can read and analyze, but not write."""
        return ["read", "glob", "grep"]

    async def _execute_task(self, task: str) -> Dict[str, Any]:
        """
        Execute architecture task.
        Returns a structured plan for other agents to follow.
        """
        # Build messages for the AI provider
        messages = [
            {
                "role": "user",
                "content": f"""Task: {task}

Create a CONCRETE implementation plan for this task.

Your plan should specify:
1. WHAT FILES to create (exact filenames)
2. WHAT CODE to write (functions, classes, structure)
3. HOW the code should work (logic, algorithms)
4. Any dependencies or setup needed

Example good plan for "create calculator app":
- Create calculator.html with HTML structure
- Include CSS for styling
- Add JavaScript for calculation logic (add, subtract, multiply, divide functions)
- Create event handlers for button clicks
- Display results in output div

Do NOT say "let me check existing code" - assume this is NEW code to be created from scratch.
Be specific and actionable so the Coder knows exactly what to build.

Current context:
{self.context}
"""
            }
        ]

        # Call AI provider
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

        # Extract plan from response
        plan_text = ""
        tool_results = []

        for block in response.content:
            if block.type == "text":
                plan_text += block.text
            elif block.type == "tool_use":
                # Execute read/glob/grep tools if architect needs to analyze codebase
                # (Simplified - actual implementation would execute tools)
                tool_results.append({
                    "tool": block.name,
                    "input": block.input
                })

        # Ensure plan is not empty
        if not plan_text.strip():
            plan_text = f"Architecture plan for: {task}\n\n(Plan generation in progress or no detailed plan provided by architect)"

        return {
            "plan": plan_text,
            "tool_usage": tool_results,
            "status": "complete"
        }
