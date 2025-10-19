#!/bin/bash

# ANSI color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}    FastAPI Authentication Server    ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check for Python
if ! command -v python3 &> /dev/null; then
  echo -e "${RED}Python 3 is not installed. Please install Python 3 and try again.${NC}"
  exit 1
fi

# Create a Python virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo -e "${YELLOW}Creating Python virtual environment...${NC}"
  python3 -m venv venv
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create virtual environment.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Virtual environment created successfully.${NC}"
fi

# Activate the virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate || source venv/Scripts/activate

# Install required dependencies
echo -e "${YELLOW}Installing required dependencies...${NC}"
pip install fastapi uvicorn[standard] python-dotenv
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install dependencies.${NC}"
  exit 1
fi
echo -e "${GREEN}Dependencies installed successfully.${NC}"

# Kill any existing Python processes running on port 3000
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

echo -e "${GREEN}Starting FastAPI Authentication Server on port ${PORT}...${NC}"
echo -e "${YELLOW}API documentation available at: http://localhost:${PORT}/docs${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server.${NC}"
echo -e "${BLUE}=====================================${NC}"

# Run the FastAPI server
uvicorn fastapi_auth_server:app --reload --host 0.0.0.0 --port ${PORT}

# When the server stops, deactivate the virtual environment
deactivate