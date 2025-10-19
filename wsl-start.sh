#!/bin/bash

# Define colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Display welcome banner
echo -e "${BLUE}"
echo "======================================================"
echo "    StockSageAI - WSL Development Environment Setup    "
echo "======================================================"
echo -e "${NC}"

# Step 1: Check if PostgreSQL is installed
echo -e "${YELLOW}[1/5] Checking PostgreSQL installation...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed. Installing PostgreSQL...${NC}"
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    echo -e "${GREEN}PostgreSQL installed successfully.${NC}"
else
    echo -e "${GREEN}PostgreSQL is already installed.${NC}"
fi

# Step 2: Fix PostgreSQL configuration
echo -e "\n${YELLOW}[2/5] Configuring PostgreSQL...${NC}"
chmod +x ./fix-postgres.sh
./fix-postgres.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to configure PostgreSQL. Please check the error messages above.${NC}"
    exit 1
else
    echo -e "${GREEN}PostgreSQL configured successfully.${NC}"
fi

# Step 3: Install Node.js dependencies
echo -e "\n${YELLOW}[3/5] Installing Node.js dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Node.js dependencies. Please check the error messages above.${NC}"
    exit 1
else
    echo -e "${GREEN}Node.js dependencies installed successfully.${NC}"
fi

# Step 4: Initialize database schema and seed data
echo -e "\n${YELLOW}[4/5] Initializing database schema...${NC}"
npm run db:push
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to initialize database schema. Please check the error messages above.${NC}"
    echo -e "${YELLOW}Attempting to seed the database manually...${NC}"
    npx tsx run-seed.ts
fi

# Step 5: Start the application
echo -e "\n${YELLOW}[5/5] Starting the application...${NC}"
echo -e "${BLUE}Backend will run on: http://localhost:3000${NC}"
echo -e "${BLUE}Frontend will run on: http://localhost:5000${NC}"
echo -e "${BLUE}Login with:${NC}"
echo -e "${GREEN}  - Admin: admin@quantumtrade.ai / admin123${NC}"
echo -e "${GREEN}  - User: user@quantumtrade.ai / user123${NC}"
echo -e "\n${YELLOW}Starting application...${NC}"
npm run dev