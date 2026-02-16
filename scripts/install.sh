#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Installation directory
INSTALL_DIR="$HOME/agentdocks"

echo ""
echo -e "${PURPLE}⚡ AgentDocks.ai Installer${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print error and exit
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print info
info() {
    echo -e "${BLUE}→ $1${NC}"
}

# Check dependencies
info "Checking dependencies..."

if ! command_exists node; then
    error_exit "Node.js is not installed. Install from https://nodejs.org or run: brew install node"
fi

if ! command_exists python3; then
    error_exit "Python 3 is not installed. Install from https://python.org or run: brew install python3"
fi

if ! command_exists git; then
    error_exit "Git is not installed. Install from https://git-scm.com or run: brew install git"
fi

success "All dependencies found"
echo ""

# Clone or update repository
if [ -d "$INSTALL_DIR" ]; then
    info "Existing installation found, updating..."
    cd "$INSTALL_DIR"

    # Stash any local changes
    git stash >/dev/null 2>&1 || true

    # Pull latest changes
    git pull origin main || error_exit "Failed to update repository"
    success "Updated to latest version"
else
    info "Cloning AgentDocks repository..."
    git clone https://github.com/LoFiTerminal/AgentDocks.git "$INSTALL_DIR" || error_exit "Failed to clone repository"
    success "Repository cloned"
fi

echo ""
cd "$INSTALL_DIR"

# Install frontend dependencies
info "Installing frontend dependencies..."
cd frontend
npm install --silent || error_exit "Failed to install frontend dependencies"
success "Frontend dependencies installed"
echo ""

# Install backend dependencies
info "Installing backend dependencies..."
cd ../backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv || error_exit "Failed to create virtual environment"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt || error_exit "Failed to install backend dependencies"
deactivate
success "Backend dependencies installed"
echo ""

# Create launcher script
info "Creating launcher script..."

# Try to install to /usr/local/bin (requires sudo if not writable)
if [ -w /usr/local/bin ]; then
    LAUNCHER_PATH="/usr/local/bin/agentdocks"
    USE_SUDO=false
elif [ -d /usr/local/bin ]; then
    LAUNCHER_PATH="/usr/local/bin/agentdocks"
    USE_SUDO=true
    info "Need sudo access to install to /usr/local/bin..."
else
    # Fallback to ~/.local/bin
    mkdir -p "$HOME/.local/bin"
    LAUNCHER_PATH="$HOME/.local/bin/agentdocks"
    USE_SUDO=false

    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo "" >> "$HOME/.bashrc"
        echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$HOME/.bashrc"

        if [ -f "$HOME/.zshrc" ]; then
            echo "" >> "$HOME/.zshrc"
            echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$HOME/.zshrc"
        fi

        echo ""
        echo -e "${YELLOW}⚠ Added ~/.local/bin to PATH. Restart your shell or run:${NC}"
        echo -e "${YELLOW}   source ~/.bashrc${NC}"
    fi
fi

# Create the launcher script content
LAUNCHER_CONTENT='#!/bin/bash
set -e

# Colors
GREEN='"'"'\033[0;32m'"'"'
BLUE='"'"'\033[0;34m'"'"'
PURPLE='"'"'\033[0;35m'"'"'
NC='"'"'\033[0m'"'"'

cd ~/agentdocks

echo ""
echo -e "${PURPLE}⚡ Starting AgentDocks.ai...${NC}"
echo ""

# Start backend
echo -e "${BLUE}→ Starting backend...${NC}"
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!
deactivate

# Start frontend
echo -e "${BLUE}→ Starting frontend...${NC}"
cd ../frontend
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

# Wait for services to start
echo -e "${BLUE}→ Waiting for servers to boot...${NC}"
sleep 3

# Open browser
open http://localhost:3000 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ AgentDocks is running at http://localhost:3000${NC}"
echo ""
echo -e "   Press ${PURPLE}Ctrl+C${NC} to stop"
echo ""

# Trap Ctrl+C
trap "echo '"'"''"'"'; echo '"'"'Stopping AgentDocks...'"'"'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '"'"'Goodbye!'"'"'; exit" INT TERM

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
'

# Write launcher script (with sudo if needed)
if [ "$USE_SUDO" = true ]; then
    echo "$LAUNCHER_CONTENT" | sudo tee "$LAUNCHER_PATH" > /dev/null
    sudo chmod +x "$LAUNCHER_PATH"
else
    echo "$LAUNCHER_CONTENT" > "$LAUNCHER_PATH"
    chmod +x "$LAUNCHER_PATH"
fi
success "Launcher script created"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ AgentDocks installed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${PURPLE}To run AgentDocks:${NC}"
echo -e "   ${BLUE}agentdocks${NC}"
echo ""
echo -e "${PURPLE}Or manually:${NC}"
echo -e "   ${BLUE}cd ~/agentdocks && make dev${NC}"
echo ""
echo -e "${PURPLE}For more info:${NC}"
echo -e "   ${BLUE}https://github.com/LoFiTerminal/AgentDocks${NC}"
echo ""
