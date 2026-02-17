"""
Browser automation manager for AgentDocks.

Manages Playwright browser sessions within sandboxes, supporting actions like
navigate, click, type, screenshot, extract, wait, execute, and close.
"""

import asyncio
import base64
import json
import logging
from typing import Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class BrowserManager:
    """Manages a persistent Playwright browser session within a sandbox."""

    def __init__(self, sandbox):
        """
        Initialize browser manager.

        Args:
            sandbox: Sandbox instance (DockerSandbox or E2BSandbox)
        """
        self.sandbox = sandbox
        self.initialized = False
        self.browser_script_path = "/tmp/browser_control.py"
        self.screenshots_dir = "/tmp/screenshots"

    async def initialize(self):
        """Initialize the browser environment in the sandbox."""
        if self.initialized:
            return

        logger.info("🌐 Initializing browser environment...")

        # Create browser control script
        browser_script = self._generate_browser_control_script()

        # Upload script to sandbox
        await self.sandbox.write_file(self.browser_script_path, browser_script)

        # Create screenshots directory
        await self.sandbox.execute_bash(f"mkdir -p {self.screenshots_dir}")

        # Ensure playwright is installed (for E2B)
        if hasattr(self.sandbox, '_ensure_playwright_installed'):
            await self.sandbox._ensure_playwright_installed()

        self.initialized = True
        logger.info("✅ Browser environment initialized")

    async def execute_action(
        self,
        action: str,
        url: Optional[str] = None,
        selector: Optional[str] = None,
        text: Optional[str] = None,
        full_page: bool = False,
        timeout: int = 30000,
        javascript: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute a browser action.

        Args:
            action: Action to perform (navigate, click, type, screenshot, extract, wait, execute, close)
            url: URL for navigate action
            selector: CSS selector for click, type, extract, wait actions
            text: Text for type action
            full_page: Whether to capture full page screenshot
            timeout: Timeout in milliseconds (default 30000)
            javascript: JavaScript code for execute action

        Returns:
            Dict with action result, may include screenshot_data, screenshot_path, extracted_text, etc.
        """
        # Initialize if needed
        if not self.initialized:
            await self.initialize()

        # Build command arguments
        command_args = {
            "action": action,
            "timeout": timeout,
        }

        if url:
            command_args["url"] = url
        if selector:
            command_args["selector"] = selector
        if text:
            command_args["text"] = text
        if full_page:
            command_args["full_page"] = full_page
        if javascript:
            command_args["javascript"] = javascript

        # Encode arguments as JSON
        args_json = json.dumps(command_args)
        args_json_escaped = args_json.replace('"', '\\"').replace("'", "\\'")

        # Execute browser control script
        logger.info(f"🌐 Executing browser action: {action}")

        try:
            # Run with timeout protection
            command = f'python3 {self.browser_script_path} \'{args_json_escaped}\''
            result = await asyncio.wait_for(
                self.sandbox.execute_bash(command),
                timeout=timeout / 1000 + 5  # Add 5s buffer
            )

            # Parse result
            result_data = json.loads(result)

            # If screenshot was taken, read and encode it
            if result_data.get("screenshot_path"):
                screenshot_path = result_data["screenshot_path"]
                screenshot_content = await self.sandbox.read_file(screenshot_path)
                result_data["screenshot_data"] = base64.b64encode(screenshot_content).decode('utf-8')

            logger.info(f"✅ Browser action completed: {action}")
            return result_data

        except asyncio.TimeoutError:
            logger.error(f"❌ Browser action timed out: {action}")
            return {
                "success": False,
                "error": f"Action '{action}' timed out after {timeout}ms"
            }
        except json.JSONDecodeError as e:
            logger.error(f"❌ Failed to parse browser action result: {e}")
            return {
                "success": False,
                "error": f"Failed to parse result: {str(e)}"
            }
        except Exception as e:
            logger.error(f"❌ Browser action failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def close(self):
        """Close the browser and cleanup resources."""
        if not self.initialized:
            return

        try:
            await self.execute_action("close")
            logger.info("🌐 Browser closed")
        except Exception as e:
            logger.warning(f"Failed to close browser gracefully: {e}")

        self.initialized = False

    def _generate_browser_control_script(self) -> str:
        """Generate the Python browser control script that runs in the sandbox."""
        return """#!/usr/bin/env python3
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

# Global browser and page
_browser = None
_page = None
_playwright = None


async def init_browser():
    \"\"\"Initialize browser if not already initialized.\"\"\"
    global _browser, _page, _playwright

    if _browser is not None:
        return

    _playwright = await async_playwright().start()
    _browser = await _playwright.chromium.launch(
        headless=True,
        args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    )
    _page = await _browser.new_page(viewport={'width': 1280, 'height': 720})


async def close_browser():
    \"\"\"Close browser and cleanup.\"\"\"
    global _browser, _page, _playwright

    if _page:
        await _page.close()
    if _browser:
        await _browser.close()
    if _playwright:
        await _playwright.stop()

    _browser = None
    _page = None
    _playwright = None


async def execute_action(args):
    \"\"\"Execute browser action based on arguments.\"\"\"
    action = args['action']
    timeout = args.get('timeout', 30000)

    # Initialize browser for all actions except close
    if action != 'close':
        await init_browser()

    try:
        if action == 'navigate':
            url = args['url']
            await _page.goto(url, wait_until='domcontentloaded', timeout=timeout)
            return {'success': True, 'url': url}

        elif action == 'click':
            selector = args['selector']
            await _page.click(selector, timeout=timeout)
            return {'success': True, 'selector': selector}

        elif action == 'type':
            selector = args['selector']
            text = args['text']
            await _page.fill(selector, text, timeout=timeout)
            return {'success': True, 'selector': selector, 'text': text}

        elif action == 'screenshot':
            full_page = args.get('full_page', False)
            screenshot_path = f"/tmp/screenshots/screenshot_{asyncio.get_event_loop().time()}.png"
            Path(screenshot_path).parent.mkdir(parents=True, exist_ok=True)
            await _page.screenshot(path=screenshot_path, full_page=full_page, timeout=timeout)
            return {'success': True, 'screenshot_path': screenshot_path}

        elif action == 'extract':
            selector = args['selector']
            elements = await _page.query_selector_all(selector)
            texts = []
            for element in elements:
                text = await element.text_content()
                if text:
                    texts.append(text.strip())
            return {'success': True, 'selector': selector, 'extracted_text': texts}

        elif action == 'wait':
            selector = args['selector']
            await _page.wait_for_selector(selector, timeout=timeout)
            return {'success': True, 'selector': selector}

        elif action == 'execute':
            javascript = args['javascript']
            result = await _page.evaluate(javascript)
            return {'success': True, 'result': result}

        elif action == 'close':
            await close_browser()
            return {'success': True}

        else:
            return {'success': False, 'error': f'Unknown action: {action}'}

    except PlaywrightTimeout:
        return {'success': False, 'error': f'Timeout executing {action}'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


async def main():
    \"\"\"Main entry point.\"\"\"
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No arguments provided'}))
        sys.exit(1)

    try:
        args = json.loads(sys.argv[1])
        result = await execute_action(args)
        print(json.dumps(result))
    except json.JSONDecodeError as e:
        print(json.dumps({'success': False, 'error': f'Invalid JSON: {str(e)}'}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
"""


# Cleanup function for sandbox
async def cleanup_browser(sandbox):
    """Cleanup browser resources when sandbox is destroyed."""
    if hasattr(sandbox, '_browser_manager'):
        await sandbox._browser_manager.close()
