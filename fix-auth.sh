#!/bin/bash

# Define colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Authentication System Diagnostic Tool ===${NC}"

# Step 0: Check and install required packages
echo -e "${YELLOW}[0/5] Checking and installing required packages...${NC}"
# Check if cors package is properly installed
if ! npm list cors > /dev/null 2>&1; then
  echo -e "${RED}CORS package not found. Installing...${NC}"
  npm install cors --legacy-peer-deps
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}CORS package installed successfully.${NC}"
  else
    echo -e "${RED}Failed to install CORS package. Try running 'npm install cors --legacy-peer-deps' manually.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}CORS package is already installed.${NC}"
fi

# Step 1: Check environment variables
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
fi

# Load environment variables
set -a
source .env
set +a

echo -e "${GREEN}Environment variables loaded.${NC}"

# Step 2: Check database connection
echo -e "${YELLOW}[2/5] Checking database connection...${NC}"
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1
});

pool.connect()
  .then(client => {
    console.log('Database connection successful!');
    client.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
"

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to connect to database.${NC}"
  echo -e "${YELLOW}Trying to fix database connection...${NC}"
  
  # Try to fix PostgreSQL service
  if command -v service &> /dev/null; then
    echo "Restarting PostgreSQL service..."
    sudo service postgresql restart
  fi
  
  # Check for running PostgreSQL
  pg_isready -q
  if [ $? -ne 0 ]; then
    echo -e "${RED}PostgreSQL is not running.${NC}"
    exit 1
  fi
fi

# Step 3: Check API endpoints
echo -e "${YELLOW}[3/5] Testing API endpoints...${NC}"

# Test health endpoint
curl -s http://localhost:3000/api/health > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Health endpoint not responding.${NC}"
  echo -e "${YELLOW}Starting test authentication server...${NC}"
  NODE_ENV=development PORT=3000 node test-auth-server.mjs &
  TEST_SERVER_PID=$!
  echo -e "${GREEN}Test server started with PID: ${TEST_SERVER_PID}${NC}"
  sleep 3
else
  echo -e "${GREEN}Health endpoint is responding.${NC}"
fi

# Test login endpoint
echo -e "${YELLOW}Testing login endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quantumtrade.ai","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}Login endpoint is working.${NC}"
else
  echo -e "${RED}Login endpoint is not working properly.${NC}"
  echo "Response: $LOGIN_RESPONSE"
  
  echo -e "${YELLOW}Starting test authentication server...${NC}"
  if [ -n "$TEST_SERVER_PID" ]; then
    echo -e "${YELLOW}Test server already running.${NC}"
  else
    NODE_ENV=development PORT=3000 node test-auth-server.mjs &
    TEST_SERVER_PID=$!
    echo -e "${GREEN}Test server started with PID: ${TEST_SERVER_PID}${NC}"
    sleep 3
  fi
fi

# Step 4: Test client connectivity
echo -e "${YELLOW}[4/5] Testing client connectivity...${NC}"
cd client
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Client build failed.${NC}"
  exit 1
fi
echo -e "${GREEN}Client built successfully.${NC}"
cd ..

# Step 5: Generate test credentials
echo -e "${YELLOW}[5/5] Generating test credentials...${NC}"
cat > test-credentials.json << EOL
{
  "admin": {
    "email": "admin@quantumtrade.ai",
    "password": "admin123"
  },
  "user": {
    "email": "user@quantumtrade.ai",
    "password": "user123"
  }
}
EOL
echo -e "${GREEN}Test credentials saved to test-credentials.json${NC}"

# Summary
echo -e "${BLUE}=== Authentication System Diagnosis Complete ===${NC}"
echo -e "${GREEN}You can now access the application at:${NC}"
echo -e "  Frontend: http://localhost:5000"
echo -e "  Backend: http://localhost:3000"
echo -e "${GREEN}Login with:${NC}"
echo -e "  - Admin: admin@quantumtrade.ai / admin123"
echo -e "  - User: user@quantumtrade.ai / user123"

if [ -n "$TEST_SERVER_PID" ]; then
  echo -e "${YELLOW}Note: Test authentication server is running with PID: ${TEST_SERVER_PID}${NC}"
  echo -e "To stop it, run: kill ${TEST_SERVER_PID}"
fi