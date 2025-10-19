#!/bin/bash

# Define colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== StockSageAI Debug Mode ===${NC}"

# Set debug environment variables
export DEBUG=true
export NODE_ENV=development
export DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade
export PORT=3000
export SERVER_HOST=0.0.0.0
export LOG_LEVEL=debug

# Initialize the database first
echo -e "${YELLOW}Initializing database...${NC}"
node db-initializer.js

# Check if the database initialization was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Database initialization failed.${NC}"
  echo -e "${YELLOW}Continuing anyway...${NC}"
fi

# Start the server with debug logging
echo -e "${YELLOW}Starting server in debug mode...${NC}"
echo -e "${GREEN}Backend URL: http://localhost:3000${NC}"
npx nodemon --exec "npx tsx server/index.ts" --watch server --ext ts,json