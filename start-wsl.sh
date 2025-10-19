#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================${NC}"
echo -e "${CYAN}      Quantum Trade WSL Startup Script        ${NC}"
echo -e "${CYAN}==============================================${NC}"
echo ""

# Check if we're in WSL
if ! grep -q Microsoft /proc/version; then
  echo -e "${RED}This script is designed for WSL environments.${NC}"
  echo -e "${RED}It looks like you're not running in WSL.${NC}"
  echo -e "${YELLOW}You can still continue, but you might encounter issues.${NC}"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Find the WSL IP address
WSL_IP=$(hostname -I | awk '{print $1}')
echo -e "${YELLOW}WSL IP Address: ${WSL_IP}${NC}"
echo ""

# Ensure we're in the project root
cd "$(dirname "$0")"
echo -e "${GREEN}Working directory: $(pwd)${NC}"
echo ""

# Check if node_modules exist, if not install
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing server dependencies...${NC}"
  npm install
fi

if [ ! -d "client/node_modules" ]; then
  echo -e "${YELLOW}Installing client dependencies...${NC}"
  cd client && npm install && cd ..
fi

# Create process log directory
mkdir -p logs

# Check if server port is already in use
if netstat -tuln | grep -q ":3000 "; then
  echo -e "${RED}Port 3000 is already in use. Please stop the existing process and try again.${NC}"
  echo "Running processes on port 3000:"
  lsof -i :3000
  exit 1
fi

# Start the backend server in a new terminal
echo -e "${CYAN}1. Starting backend server on port 3000...${NC}"
gnome-terminal -- bash -c "export SERVER_HOST=0.0.0.0; export PORT=3000; npm run dev:server | tee logs/server.log" &
echo ""

# Wait for the server to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 5
echo ""

# Check if server is responding
if curl -s http://localhost:3000/api/health > /dev/null; then
  echo -e "${GREEN}✓ Backend server is running!${NC}"
else
  echo -e "${RED}✗ Backend server is not responding. Check logs/server.log for errors.${NC}"
fi

echo ""

# Start the frontend
echo -e "${CYAN}2. Starting frontend client on port 5000...${NC}"
gnome-terminal -- bash -c "cd client && VITE_DEV_SERVER_HOST=0.0.0.0 npm run dev | tee ../logs/client.log" &
echo ""

echo -e "${YELLOW}Waiting for frontend to initialize...${NC}"
sleep 5

# Check if client is responding
if curl -s http://localhost:5000 > /dev/null; then
  echo -e "${GREEN}✓ Frontend client is running!${NC}"
else
  echo -e "${RED}✗ Frontend client is not responding. Check logs/client.log for errors.${NC}"
fi

echo ""
echo -e "${CYAN}==============================================${NC}"
echo -e "${GREEN}Quantum Trade is starting!${NC}"
echo ""
echo -e "${YELLOW}* Backend: http://localhost:3000${NC}"
echo -e "${YELLOW}* Backend (WSL): http://${WSL_IP}:3000${NC}"
echo -e "${YELLOW}* Frontend: http://localhost:5000${NC}"
echo -e "${YELLOW}* Frontend (WSL): http://${WSL_IP}:5000${NC}"
echo ""
echo -e "${YELLOW}Use Ctrl+C in the terminal windows to stop the servers.${NC}"
echo -e "${CYAN}==============================================${NC}"
echo ""
echo -e "${GREEN}Use these WSL addresses in your Windows browser:${NC}"
echo -e "Navigate to ${CYAN}http://${WSL_IP}:5000${NC} in your Windows browser."
echo ""
