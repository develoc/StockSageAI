#!/bin/bash

# Colors for better terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================${NC}"
echo -e "${CYAN}    Quantum Trade WSL Linux Startup Script     ${NC}"
echo -e "${CYAN}==============================================${NC}"
echo ""

# Ensure we're in the project directory
cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"
echo -e "${GREEN}Working directory: ${PROJECT_DIR}${NC}"
echo ""

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required commands
echo -e "${YELLOW}Checking for required Linux commands...${NC}"
MISSING_COMMANDS=0
for cmd in node npm curl grep ip; do
  if ! command_exists $cmd; then
    echo -e "${RED}✗ Command not found: $cmd${NC}"
    MISSING_COMMANDS=$((MISSING_COMMANDS+1))
  else
    echo -e "${GREEN}✓ Found command: $cmd${NC}"
  fi
done

if [ $MISSING_COMMANDS -gt 0 ]; then
  echo -e "${RED}Please install the missing commands and try again.${NC}"
  echo -e "You can use: sudo apt update && sudo apt install -y nodejs npm curl iproute2"
  exit 1
fi

echo ""

# Get the host IP (Windows host from WSL)
echo -e "${YELLOW}Detecting host IP address...${NC}"
HOST_IP=$(ip route | grep default | awk '{print $3}' 2>/dev/null || echo "")

if [ -z "$HOST_IP" ]; then
  HOST_IP="172.17.0.1" # Common default for WSL2
  echo -e "${YELLOW}Could not detect host IP, using default: ${HOST_IP}${NC}"
else
  echo -e "${GREEN}Detected host IP: ${HOST_IP}${NC}"
fi

# Configure environment for client
echo -e "\n${YELLOW}Configuring client environment...${NC}"
mkdir -p "${PROJECT_DIR}/client"
cat > "${PROJECT_DIR}/client/.env" <<EOL
# WSL-specific configuration
HOST_IP=${HOST_IP}

# Server Configuration
VITE_DEV_SERVER_HOST=0.0.0.0
VITE_DEV_SERVER_PORT=5000
EOL
echo -e "${GREEN}✓ Created/updated client/.env file${NC}"

# Check if required node modules are installed
echo -e "\n${YELLOW}Checking node modules...${NC}"
if [ ! -d "${PROJECT_DIR}/node_modules" ]; then
  echo -e "Installing server dependencies..."
  npm install
else
  echo -e "${GREEN}✓ Server dependencies found${NC}"
fi

if [ ! -d "${PROJECT_DIR}/client/node_modules" ]; then
  echo -e "Installing client dependencies..."
  (cd "${PROJECT_DIR}/client" && npm install)
else
  echo -e "${GREEN}✓ Client dependencies found${NC}"
fi

# Function to check if a port is in use
port_in_use() {
  netstat -tuln | grep -q ":$1 "
}

# Kill existing processes if needed
if port_in_use 3000; then
  echo -e "${YELLOW}Port 3000 is already in use. Attempting to kill the process...${NC}"
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

if port_in_use 5000; then
  echo -e "${YELLOW}Port 5000 is already in use. Attempting to kill the process...${NC}"
  lsof -ti:5000 | xargs kill -9 2>/dev/null || true
fi

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_DIR}/logs"

# Start the backend server
echo -e "\n${CYAN}Starting backend server on port 3000...${NC}"

# Use tmux if available, otherwise use a background process
if command_exists tmux; then
  echo -e "Using tmux for server process management..."
  tmux new-session -d -s stocksage-server "cd ${PROJECT_DIR} && export PORT=3000 HOST=0.0.0.0 && npm run dev:server | tee logs/server.log"
  echo -e "${GREEN}✓ Server started in tmux session 'stocksage-server'${NC}"
  echo -e "To attach to server: ${CYAN}tmux attach -t stocksage-server${NC}"
else
  echo -e "Starting server as a background process..."
  cd "${PROJECT_DIR}" && PORT=3000 HOST=0.0.0.0 npm run dev:server > logs/server.log 2>&1 &
  SERVER_PID=$!
  echo -e "${GREEN}✓ Server started with PID: ${SERVER_PID}${NC}"
fi

# Wait for server to start
echo -e "${YELLOW}Waiting for server to initialize...${NC}"
sleep 5

# Verify server is running
echo -e "\n${YELLOW}Verifying server connection...${NC}"
if curl -s http://localhost:3000/api/health > /dev/null; then
  echo -e "${GREEN}✓ Backend server is running!${NC}"
else
  echo -e "${RED}✗ Backend server is not responding.${NC}"
  echo -e "Check logs at: ${PROJECT_DIR}/logs/server.log"
  echo -e "You can also try starting it manually with:"
  echo -e "${CYAN}cd ${PROJECT_DIR} && PORT=3000 HOST=0.0.0.0 npm run dev:server${NC}"
fi

# Start the frontend client
echo -e "\n${CYAN}Starting frontend client on port 5000...${NC}"

# Use tmux if available, otherwise use a background process
if command_exists tmux; then
  tmux new-session -d -s stocksage-client "cd ${PROJECT_DIR}/client && export HOST_IP=${HOST_IP} VITE_DEV_SERVER_HOST=0.0.0.0 && npm run dev | tee ../logs/client.log"
  echo -e "${GREEN}✓ Client started in tmux session 'stocksage-client'${NC}"
  echo -e "To attach to client: ${CYAN}tmux attach -t stocksage-client${NC}"
else
  cd "${PROJECT_DIR}/client" && HOST_IP=${HOST_IP} VITE_DEV_SERVER_HOST=0.0.0.0 npm run dev > ../logs/client.log 2>&1 &
  CLIENT_PID=$!
  echo -e "${GREEN}✓ Client started with PID: ${CLIENT_PID}${NC}"
fi

# Wait for client to start
echo -e "${YELLOW}Waiting for client to initialize...${NC}"
sleep 5

# Verify client is running
echo -e "\n${YELLOW}Verifying client connection...${NC}"
if curl -s http://localhost:5000 > /dev/null; then
  echo -e "${GREEN}✓ Frontend client is running!${NC}"
else
  echo -e "${RED}✗ Frontend client is not responding.${NC}"
  echo -e "Check logs at: ${PROJECT_DIR}/logs/client.log"
  echo -e "You can also try starting it manually with:"
  echo -e "${CYAN}cd ${PROJECT_DIR}/client && HOST_IP=${HOST_IP} VITE_DEV_SERVER_HOST=0.0.0.0 npm run dev${NC}"
fi

echo ""
echo -e "${CYAN}==============================================${NC}"
echo -e "${GREEN}Quantum Trade is running!${NC}"
echo ""
echo -e "${YELLOW}* Backend: http://localhost:3000${NC}"
echo -e "${YELLOW}* Frontend: http://localhost:5000${NC}"
echo ""
echo -e "${GREEN}WSL IP: $(hostname -I | awk '{print $1}')${NC}"
echo -e "You can access the app from Windows at:"
echo -e "${CYAN}http://$(hostname -I | awk '{print $1}'):5000${NC}"
echo -e "${CYAN}==============================================${NC}"

# WSL-specific Linux commands to check logs
echo -e "\n${YELLOW}Useful Linux commands:${NC}"
echo -e "- View server logs: ${CYAN}tail -f ${PROJECT_DIR}/logs/server.log${NC}"
echo -e "- View client logs: ${CYAN}tail -f ${PROJECT_DIR}/logs/client.log${NC}"
echo -e "- Check running processes: ${CYAN}ps aux | grep node${NC}"
echo -e "- Kill all node processes: ${CYAN}pkill -f node${NC}"
echo -e "- Check network connections: ${CYAN}netstat -tuln | grep '3000\\|5000'${NC}"
echo ""

# Open the app in the default browser if xdg-open is available
if command_exists xdg-open; then
  echo -e "${YELLOW}Opening application in browser...${NC}"
  xdg-open http://localhost:5000
fi
