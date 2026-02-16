"""Reviewer Agent - Reviews code quality and approves changes."""

from .base_agent import BaseAgent, AgentRole
from typing import Dict, Any, List


class ReviewerAgent(BaseAgent):
    """
    Reviewer Agent specializes in:
    - Code review and quality assessment
    - Security analysis
    - Performance review
    - Best practices compliance
    - Approval/rejection decisions
    """

    def __init__(self, agent_id: str, sandbox, provider, model: str):
        super().__init__(agent_id, AgentRole.REVIEWER, sandbox, provider, model)

    def get_system_prompt(self) -> str:
        return """You are a Senior Code Reviewer and Technical Lead.

Your responsibilities:
1. Review code for quality, readability, and maintainability
2. Check for security vulnerabilities
3. Assess performance implications
4. Verify best practices are followed
5. Ensure tests are adequate
6. Approve or reject changes with clear feedback

Review checklist:
□ Code Quality
  - Clear variable/function names
  - Appropriate comments for complex logic
  - No code duplication
  - Proper error handling

□ Security
  - No SQL injection vulnerabilities
  - No XSS vulnerabilities
  - Input validation
  - No hardcoded secrets

□ Performance
  - Efficient algorithms
  - No unnecessary loops
  - Proper database queries
  - Caching where appropriate

□ Testing
  - Adequate test coverage
  - Edge cases tested
  - Tests are clear and maintainable

□ Best Practices
  - Follows language conventions
  - Follows project patterns
  - Properly documented
  - No anti-patterns

Tools at your disposal:
- read: Read implementation and tests
- grep: Search for patterns, potential issues
- glob: Find related files

Review format:
1. Summary (Approve/Request Changes/Reject)
2. Strengths (what's done well)
3. Issues (categorized by severity: Critical/Major/Minor)
4. Suggestions (improvements)
5. Security concerns (if any)
6. Performance notes (if any)

Be constructive, specific, and helpful in your feedback.
"""

    def get_available_tools(self) -> List[str]:
        """Reviewer can read and analyze, but not modify code."""
        return ["read", "glob", "grep"]

    async def _execute_task(self, task: str) -> Dict[str, Any]:
        """
        Execute code review task.
        Reviews implementation, tests, and gives approval/feedback.
        """
        # Get files to review from shared context
        files_modified = self.context.get("files_modified", [])
        test_results = self.context.get("test_results", {})
        
        messages = [
            {
                "role": "user",
                "content": f"""Task: {task}

Review the following changes:

Files modified: {files_modified}
Test results: {test_results}

Provide a comprehensive code review including:
1. Overall assessment (Approve/Request Changes/Reject)
2. Code quality review
3. Security analysis
4. Performance considerations
5. Test adequacy
6. Specific feedback for each issue found

Be thorough but constructive.

Context:
{self.context}
"""
            }
        ]

        # Call AI provider
        from core.tools import TOOLS
        response = await self.provider.complete(
            messages=messages,
            tools=[tool for tool in TOOLS if tool["name"] in self.get_available_tools()],
            model=self.model,
            system=self.get_system_prompt()
        )

        # Parse review
        review_text = []
        issues_found = []
        decision = "PENDING"
        
        for block in response.content:
            if block.type == "text":
                review_text.append(block.text)
                # Try to extract decision
                text_lower = block.text.lower()
                if "approve" in text_lower and "not approve" not in text_lower:
                    decision = "APPROVED"
                elif "reject" in text_lower:
                    decision = "REJECTED"
                elif "request changes" in text_lower or "needs work" in text_lower:
                    decision = "CHANGES_REQUESTED"

        review_content = "\n".join(review_text)

        return {
            "decision": decision,
            "review": review_content,
            "issues": issues_found,
            "status": "complete"
        }
