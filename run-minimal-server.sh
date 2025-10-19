#!/bin/bash

# ANSI color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}       Minimal Test Server          ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
  exit 1
fi

# Ensure dependencies are installed
if [ ! -d "node_modules/express" ]; then
  echo -e "${YELLOW}Installing required dependencies...${NC}"
  npm install express cors dotenv
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Dependencies installed successfully.${NC}"
else
  echo -e "${GREEN}Dependencies already installed.${NC}"
fi

# Kill any existing Node.js processes running on port 3000
echo -e "${YELLOW}Checking for processes on port 3000...${NC}"
if command -v lsof &> /dev/null; then
  PORT_PID=$(lsof -ti:3000)
  if [ ! -z "$PORT_PID" ]; then
    echo -e "${YELLOW}Killing process $PORT_PID on port 3000...${NC}"
    kill -9 $PORT_PID
  fi
elif command -v netstat &> /dev/null; then
  echo -e "${YELLOW}Using netstat to find processes...${NC}"
  # More complex for Windows/WSL
  echo -e "${YELLOW}Please manually kill any processes using port 3000 if needed.${NC}"
fi

# Set PORT environment variable if not already set
if [ -z "$PORT" ]; then
  export PORT=3000
fi

echo -e "${GREEN}Starting minimal test server on port ${PORT}...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server.${NC}"
echo -e "${BLUE}=====================================${NC}"

# Run the minimal server
node minimal-server.js