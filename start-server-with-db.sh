#!/bin/bash

# Define colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== QuantumTrade AI Server Startup ===${NC}"

# Step 1: Check if .env file exists
echo -e "${YELLOW}[1/4] Checking environment configuration...${NC}"
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found!${NC}"
  echo "Creating default .env file..."
  cat > .env << EOL
# Database Configuration
DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
NODE_ENV=development
PORT=3000
EOL
  echo -e "${GREEN}Default .env file created.${NC}"
else
  echo -e "${GREEN}.env file found.${NC}"
fi

# Step 2: Ensure PostgreSQL is running
echo -e "${YELLOW}[2/4] Ensuring PostgreSQL is running...${NC}"
chmod +x ./fix-postgres.sh
./fix-postgres.sh

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start PostgreSQL. Aborting server start.${NC}"
  exit 1
fi
echo -e "${GREEN}PostgreSQL is running properly.${NC}"

# Step 3: Set up environment variables
echo -e "${YELLOW}[3/4] Setting up environment variables...${NC}"
export PORT=3000
export NODE_ENV=development
export SERVER_HOST=0.0.0.0

# Load variables from .env file
set -a
source .env
set +a

echo -e "${GREEN}Environment variables loaded:${NC}"
echo "DATABASE_URL: ${DATABASE_URL:-Not Set}"
echo "PORT: ${PORT}"
echo "NODE_ENV: ${NODE_ENV}"

# Step 4: Start the server with nodemon for auto-reloading
echo -e "${YELLOW}[4/4] Starting server on port $PORT...${NC}"
echo -e "${BLUE}Server logs will appear below:${NC}"
npx nodemon --exec "tsx server/index.ts" --watch server --ext ts,js