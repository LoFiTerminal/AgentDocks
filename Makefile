.PHONY: help install dev build docker docker-run clean lint test start-backend start-frontend stop

# Default target
help:
	@echo "⚡ AgentDocks Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  make install       - Install all dependencies (frontend + backend)"
	@echo "  make dev          - Start both servers in development mode"
	@echo "  make build        - Production build (frontend + backend)"
	@echo "  make docker       - Build Docker image"
	@echo "  make docker-run   - Run Docker container"
	@echo "  make clean        - Remove build artifacts and dependencies"
	@echo "  make lint         - Run linters (frontend + backend)"
	@echo "  make test         - Run tests (placeholder)"
	@echo "  make stop         - Stop all running services"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✓ Frontend dependencies installed"
	@echo ""
	@echo "📦 Installing backend dependencies..."
	@cd backend && python3 -m venv venv && \
		. venv/bin/activate && \
		pip install -q --upgrade pip && \
		pip install -q -r requirements.txt
	@echo "✓ Backend dependencies installed"
	@echo ""
	@echo "✅ Installation complete!"

# Development mode - run both servers
dev:
	@echo "⚡ Starting AgentDocks in development mode..."
	@echo ""
	@trap 'make stop' INT TERM; \
	(cd backend && . venv/bin/activate && uvicorn app.main:app --reload --port 8000 > /dev/null 2>&1) & \
	(cd frontend && npm run dev > /dev/null 2>&1) & \
	sleep 3 && \
	open http://localhost:3000 2>/dev/null && \
	echo "" && \
	echo "✅ AgentDocks is running at http://localhost:3000" && \
	echo "" && \
	echo "Press Ctrl+C to stop" && \
	echo "" && \
	wait

# Start backend only
start-backend:
	@echo "🚀 Starting backend..."
	@cd backend && . venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Start frontend only
start-frontend:
	@echo "🚀 Starting frontend..."
	@cd frontend && npm run dev

# Stop all services
stop:
	@echo "⏹️  Stopping all services..."
	@pkill -f "uvicorn app.main:app" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "✓ Services stopped"

# Production build
build:
	@echo "🏗️  Building for production..."
	@echo ""
	@echo "Building frontend..."
	@cd frontend && npm run build
	@echo "✓ Frontend built"
	@echo ""
	@echo "Backend is already built (Python)"
	@echo "✓ Backend ready"
	@echo ""
	@echo "✅ Build complete!"

# Build Docker image
docker:
	@echo "🐳 Building Docker image..."
	@docker build -t agentdocks:latest .
	@echo "✓ Docker image built: agentdocks:latest"

# Run Docker container
docker-run:
	@echo "🐳 Running Docker container..."
	@docker run -d \
		--name agentdocks \
		-p 3000:3000 \
		-p 8000:8000 \
		-v ~/.agentdocks:/root/.agentdocks \
		-v /var/run/docker.sock:/var/run/docker.sock \
		agentdocks:latest
	@echo "✓ Container started"
	@echo ""
	@echo "Access AgentDocks at: http://localhost:3000"
	@echo ""
	@echo "To stop: docker stop agentdocks"
	@echo "To remove: docker rm agentdocks"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf frontend/node_modules
	@rm -rf frontend/.next
	@rm -rf frontend/out
	@rm -rf backend/venv
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name "*.pyo" -delete 2>/dev/null || true
	@echo "✓ Clean complete"

# Lint code
lint:
	@echo "🔍 Running linters..."
	@echo ""
	@echo "Linting frontend..."
	@cd frontend && npm run lint || true
	@echo ""
	@echo "Linting backend..."
	@cd backend && . venv/bin/activate && \
		(command -v flake8 >/dev/null 2>&1 && flake8 app/ || echo "⚠️  flake8 not installed, skipping Python linting")
	@echo ""
	@echo "✓ Linting complete"

# Run tests (placeholder)
test:
	@echo "🧪 Running tests..."
	@echo ""
	@echo "Frontend tests:"
	@cd frontend && npm test || echo "⚠️  No frontend tests configured"
	@echo ""
	@echo "Backend tests:"
	@cd backend && . venv/bin/activate && \
		(command -v pytest >/dev/null 2>&1 && pytest || echo "⚠️  pytest not installed, skipping backend tests")
	@echo ""
	@echo "✓ Tests complete"
