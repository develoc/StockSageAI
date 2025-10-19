#!/bin/bash

# ANSI color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}     Minimal Auth Server Startup     ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
  exit 1
fi

# Check if the server file exists
if [ ! -f "minimal-auth-server.cjs" ]; then
  echo -e "${RED}Error: minimal-auth-server.cjs not found.${NC}"
  exit 1
fi

# Install dependencies if needed
echo -e "${YELLOW}Installing required dependencies...${NC}"
npm install express cors --no-save

# Start the server
echo -e "\n${GREEN}Starting Minimal Auth Server on port 3000...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server.${NC}"
echo -e "${CYAN}========================================================${NC}"

# First, check if port 3000 is in use and kill the process if needed
if command -v lsof &> /dev/null; then
  RUNNING_PID=$(lsof -t -i:3000)
  if [ ! -z "$RUNNING_PID" ]; then
    echo -e "${YELLOW}Port 3000 is already in use. Attempting to free it...${NC}"
    kill -9 $RUNNING_PID
    sleep 1
  fi
fi

# Run the server
echo -e "${GREEN}Starting minimal auth server...${NC}"
node minimal-auth-server.cjs