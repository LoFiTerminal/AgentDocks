#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo ""
echo -e "${PURPLE}⚡ AgentDocks.ai Uninstaller${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Confirm uninstall
echo -e "${YELLOW}This will remove:${NC}"
echo "  • AgentDocks installation ($HOME/agentdocks)"
echo "  • Launcher script (/usr/local/bin/agentdocks or ~/.local/bin/agentdocks)"
echo ""
echo -e "${YELLOW}This will NOT remove:${NC}"
echo "  • Your configuration (~/.agentdocks)"
echo "  • Shared runs (~/.agentdocks/shared-runs)"
echo ""
read -p "Continue with uninstall? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Uninstall cancelled."
    exit 0
fi

echo ""

# Stop any running instances
echo -e "${BLUE}→ Stopping running instances...${NC}"
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
echo -e "${GREEN}✓ Stopped${NC}"

# Remove installation directory
if [ -d "$HOME/agentdocks" ]; then
    echo -e "${BLUE}→ Removing installation directory...${NC}"
    rm -rf "$HOME/agentdocks"
    echo -e "${GREEN}✓ Removed${NC}"
fi

# Remove launcher script
for LAUNCHER_PATH in "/usr/local/bin/agentdocks" "$HOME/.local/bin/agentdocks"; do
    if [ -f "$LAUNCHER_PATH" ]; then
        echo -e "${BLUE}→ Removing launcher script...${NC}"
        rm -f "$LAUNCHER_PATH"
        echo -e "${GREEN}✓ Removed${NC}"
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ AgentDocks uninstalled successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Your configuration is still saved in ~/.agentdocks${NC}"
echo -e "${BLUE}To remove it: rm -rf ~/.agentdocks${NC}"
echo ""
