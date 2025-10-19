#!/bin/bash

# Define colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "===== QuantumTrade AI Development Environment ====="
echo -e "${NC}"

# Step 1: Check if PostgreSQL is running
echo -e "${BLUE}Step 1: Checking PostgreSQL service${NC}"
if command -v sudo &> /dev/null && command -v service &> /dev/null; then
  # Linux with service command
  sudo service postgresql status 2>/dev/null | grep -q "active (running)"
  if [ $? -ne 0 ]; then
    echo "PostgreSQL is not running. Attempting to start PostgreSQL service..."
    sudo service postgresql start 2>/dev/null
    sleep 2
  fi
elif command -v pg_ctl &> /dev/null; then
  # Try using pg_ctl directly
  pg_isready -q
  if [ $? -ne 0 ]; then
    echo "PostgreSQL is not running. Attempting to start PostgreSQL service..."
    pg_ctl start -D /usr/local/var/postgres 2>/dev/null
    sleep 2
  fi
fi

# Check if we can connect to PostgreSQL
psql -U postgres -c "SELECT 1" postgres &>/dev/null || psql -U dbadmin -c "SELECT 1" quantumtrade &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}PostgreSQL might not be running properly, but we'll continue anyway.${NC}"
  echo -e "${YELLOW}If you encounter database connection errors, please start PostgreSQL manually.${NC}"
else
  echo -e "${GREEN}PostgreSQL service is active and running.${NC}"
fi

# Step 2: Load environment variables
echo -e "\n${BLUE}Step 2: Setting up environment variables${NC}"
if [ ! -f .env ]; then
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
fi

# Load environment variables
set -a
source .env
set +a

echo "Environment variables loaded successfully."

# Step 3: Initialize database
echo -e "\n${BLUE}Step 3: Initializing database${NC}"
node db-initializer.js

# Step 4: Start the application
echo -e "\n${BLUE}Step 4: Starting the application${NC}"
echo "Starting development servers..."

# Export variables explicitly
export DATABASE_URL=$DATABASE_URL
export NODE_ENV=development
export PORT=3000
export SERVER_HOST=0.0.0.0

# Start the server and client
npm run dev

echo -e "${BLUE}"
echo "======================================================"
echo "    StockSageAI - Development Environment Startup     "
echo "======================================================"
echo -e "${NC}"

# Step 1: Check if .env file exists and is valid
echo -e "${YELLOW}[1/5] Checking environment configuration...${NC}"
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

# API Keys for External Services
ALPHA_VANTAGE_API_KEY=RZ1QB6NQJ5P85SPN
COINGECKO_API_KEY=CG-Ded7kEhNFRRoLoLqF5jRtXzH
EOL
  echo -e "${GREEN}Default .env file created.${NC}"
else
  echo -e "${GREEN}.env file found.${NC}"
  
  # Verify DATABASE_URL is set
  if ! grep -q "DATABASE_URL=" .env; then
    echo -e "${RED}DATABASE_URL not found in .env file.${NC}"
    echo "Adding DATABASE_URL to .env file..."
    echo "DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade" >> .env
  fi
fi

# Load environment variables
set -a
source .env
set +a

# Step 2: Ensure PostgreSQL is running
echo -e "${YELLOW}[2/5] Ensuring PostgreSQL is running...${NC}"
chmod +x ./fix-postgres.sh
./fix-postgres.sh

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start PostgreSQL. Aborting.${NC}"
  exit 1
fi

# Step 3: Install dependencies if node_modules doesn't exist
echo -e "${YELLOW}[3/5] Checking Node.js dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "Node modules not found. Installing dependencies..."
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Aborting.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}Dependencies already installed.${NC}"
fi

# Step 4: Initialize database if needed
echo -e "${YELLOW}[4/5] Initializing database...${NC}"
chmod +x ./init-database.sh
./init-database.sh

if [ $? -ne 0 ]; then
  echo -e "${RED}Database initialization failed. Trying JavaScript version...${NC}"
  node initialize-db.js
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Database initialization failed. Starting without initialization.${NC}"
  else
    echo -e "${GREEN}Database initialized successfully.${NC}"
  fi
else
  echo -e "${GREEN}Database schema updated.${NC}"
fi

# Step 5: Start the application
echo -e "${YELLOW}[5/5] Starting the application...${NC}"
echo -e "${BLUE}Backend: http://localhost:3000${NC}"
echo -e "${BLUE}Frontend: http://localhost:5000${NC}"
echo -e "${GREEN}Login with:${NC}"
echo -e "  - Admin: admin@quantumtrade.ai / admin123"
echo -e "  - User: user@quantumtrade.ai / user123"

# Export variables explicitly
export DATABASE_URL=$DATABASE_URL
export NODE_ENV=$NODE_ENV
export PORT=$PORT
export SERVER_HOST=0.0.0.0

# Start the server and client
npm run dev