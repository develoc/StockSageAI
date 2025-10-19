#!/bin/bash

# ANSI color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}      Auth Server Startup Script     ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if the .env file exists
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Warning: .env file not found. Creating default .env file...${NC}"
  echo "# Database Configuration
DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
NODE_ENV=development
PORT=3000" > .env
  echo -e "${GREEN}Created default .env file.${NC}"
fi

# Check for Node.js packages
echo -e "\n${YELLOW}Checking required packages...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
  exit 1
fi

# Check for required npm packages
if [ ! -f "node_modules/.bin/tsx" ] && [ ! -f "node_modules/.bin/nodemon" ]; then
  echo -e "${YELLOW}Installing required packages...${NC}"
  npm install dotenv express cors pg bcryptjs jsonwebtoken nodemon
fi

# Start the auth server
echo -e "\n${GREEN}Starting Auth Server on port 3000...${NC}"
echo -e "${YELLOW}This server will handle authentication requests.${NC}"

# Run with nodemon for auto-restart on changes
if command -v npx &> /dev/null; then
  npx nodemon simple-server-esm.js
else
  node simple-server-esm.js
fi