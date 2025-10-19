#!/bin/bash

# Define colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== StockSageAI Client Development Mode ===${NC}"

# Set environment variables for client
export VITE_API_URL=http://localhost:3000

# Change to client directory
cd client

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing client dependencies...${NC}"
  npm install
fi

# Start the client in development mode
echo -e "${YELLOW}Starting client in development mode...${NC}"
echo -e "${GREEN}Frontend URL: http://localhost:5000${NC}"
npm run dev