#!/bin/bash

# ANSI color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}       Authentication Server         ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
  exit 1
fi

# Check node version
NODE_VERSION=$(node -v | cut -d "v" -f 2 | cut -d "." -f 1)
if [ $NODE_VERSION -lt 14 ]; then
  echo -e "${RED}Node.js version is too old. Please upgrade to Node.js 14 or higher.${NC}"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
  echo -e "${YELLOW}Installing required dependencies...${NC}"
  npm install dotenv express cors pg bcryptjs jsonwebtoken
  echo -e "${GREEN}Dependencies installed successfully.${NC}"
else
  echo -e "${GREEN}All dependencies already installed.${NC}"
fi

# Check if auth-server.js exists
if [ ! -f "auth-server.js" ]; then
  echo -e "${RED}Error: auth-server.js not found.${NC}"
  exit 1
fi

# Set port if not specified
if [ -z "$PORT" ]; then
  export PORT=3000
fi

# Start the server
echo -e "${GREEN}Starting Authentication Server on port ${PORT}...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server.${NC}"
echo -e "${CYAN}========================================================${NC}"

# Run the server
node auth-server.js