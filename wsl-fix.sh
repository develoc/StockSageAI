#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================${NC}"
echo -e "${CYAN}      Quantum Trade WSL Quick Fix Script       ${NC}"
echo -e "${CYAN}==============================================${NC}"
echo ""

# Kill any existing processes on ports 3000 and 5000
echo -e "${YELLOW}Stopping any processes using ports 3000 and 5000...${NC}"
kill_port() {
  local port=$1
  local pid=$(lsof -t -i:$port)
  if [ -n "$pid" ]; then
    echo -e "Killing process $pid on port $port"
    kill -9 $pid 2>/dev/null || true
  else
    echo -e "No process found on port $port"
  fi
}

kill_port 3000
kill_port 5000
echo ""

# Ensure we're in the project root
cd "$(dirname "$0")"
echo -e "${GREEN}Working directory: $(pwd)${NC}"

# Find Windows host IP
echo -e "\n${YELLOW}Finding Windows host IP...${NC}"
DEFAULT_ROUTE=$(ip route | grep default | awk '{print $3}' 2>/dev/null || echo "")
if [ -z "$DEFAULT_ROUTE" ]; then
  DEFAULT_ROUTE="172.17.0.1"  # Common WSL2 gateway as fallback
  echo -e "Could not detect Windows host IP, using fallback: ${DEFAULT_ROUTE}"
else
  echo -e "Detected Windows host IP: ${GREEN}${DEFAULT_ROUTE}${NC}"
fi

# Create/update .env file with Windows host IP
echo -e "\n${YELLOW}Updating client/.env with Windows host IP...${NC}"
cat > ./client/.env <<EOL
# Windows host IP address (used when running in WSL)
WINDOWS_HOST_IP=${DEFAULT_ROUTE}

# Server Configuration
VITE_DEV_SERVER_HOST=0.0.0.0
VITE_DEV_SERVER_PORT=5000
EOL
echo -e "${GREEN}Updated client/.env file${NC}"

# Create/update server/.env file
echo -e "\n${YELLOW}Updating server/.env file...${NC}"
cat > ./server/.env <<EOL
# Server Configuration
PORT=3000
SERVER_HOST=0.0.0.0
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key
EOL
echo -e "${GREEN}Updated server/.env file${NC}"

# Start the backend server
echo -e "\n${CYAN}Starting backend server on port 3000...${NC}"
export PORT=3000
export SERVER_HOST=0.0.0.0
export NODE_ENV=development
npm run dev:server &
SERVER_PID=$!
echo -e "Backend server started with PID: ${SERVER_PID}"

# Wait a bit for the server to start
echo -e "${YELLOW}Waiting for the server to initialize...${NC}"
sleep 5

# Check if server is responding
if curl -s http://localhost:3000/api/health > /dev/null; then
  echo -e "${GREEN}✓ Backend server is running!${NC}"
else
  echo -e "${RED}✗ Backend server is not responding. Starting in debug mode...${NC}"
  kill $SERVER_PID 2>/dev/null
  echo -e "${YELLOW}Check the server logs for errors:${NC}"
  NODE_ENV=development DEBUG=* PORT=3000 SERVER_HOST=0.0.0.0 node --inspect server/index.ts
  exit 1
fi

# Start the frontend client
echo -e "\n${CYAN}Starting frontend client on port 5000...${NC}"
cd client
export VITE_DEV_SERVER_HOST=0.0.0.0
export VITE_DEV_SERVER_PORT=5000
npm run dev

# The script will wait until the frontend process completes
