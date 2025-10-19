#!/bin/bash

# This script tests the authentication API endpoints

# Define colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing Authentication API ===${NC}"

# Set port if not specified
if [ -z "$PORT" ]; then
  PORT=3000
fi

# Get the WSL IP address
WSL_IP=$(ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' || echo 'unknown')

echo -e "${YELLOW}Server Details:${NC}"
echo -e "  Local URL: ${BLUE}http://localhost:${PORT}${NC}"
echo -e "  WSL IP:    ${BLUE}${WSL_IP}${NC}"

# Test endpoints
echo -e "\n${YELLOW}Testing API Health Endpoint...${NC}"
HEALTH_RESULT=$(curl -s http://localhost:${PORT}/api/health)
HEALTH_STATUS=$?

if [ $HEALTH_STATUS -eq 0 ] && [ -n "$HEALTH_RESULT" ]; then
  echo -e "${GREEN}✅ Health endpoint reached successfully${NC}"
  echo -e "Response: $HEALTH_RESULT"
else
  echo -e "${RED}❌ Could not reach health endpoint${NC}"
  echo -e "Error code: $HEALTH_STATUS"
fi

# Test login endpoint with admin credentials
echo -e "\n${YELLOW}Testing Login Endpoint (Admin)...${NC}"
LOGIN_RESULT=$(curl -s -X POST http://localhost:${PORT}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quantumtrade.ai","password":"admin123"}')
LOGIN_STATUS=$?

if [ $LOGIN_STATUS -eq 0 ] && [ -n "$LOGIN_RESULT" ] && [[ "$LOGIN_RESULT" == *"token"* ]]; then
  echo -e "${GREEN}✅ Login endpoint working for admin${NC}"
  echo -e "Response contains token: ${GREEN}Yes${NC}"
else
  echo -e "${RED}❌ Login failed for admin${NC}"
  echo -e "Response: $LOGIN_RESULT"
fi

# Test login endpoint with user credentials
echo -e "\n${YELLOW}Testing Login Endpoint (User)...${NC}"
LOGIN_RESULT=$(curl -s -X POST http://localhost:${PORT}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@quantumtrade.ai","password":"user123"}')
LOGIN_STATUS=$?

if [ $LOGIN_STATUS -eq 0 ] && [ -n "$LOGIN_RESULT" ] && [[ "$LOGIN_RESULT" == *"token"* ]]; then
  echo -e "${GREEN}✅ Login endpoint working for regular user${NC}"
  echo -e "Response contains token: ${GREEN}Yes${NC}"
else
  echo -e "${RED}❌ Login failed for regular user${NC}"
  echo -e "Response: $LOGIN_RESULT"
fi

# Test login with WSL IP
echo -e "\n${YELLOW}Testing Login with WSL IP...${NC}"
if [ "$WSL_IP" != "unknown" ]; then
  LOGIN_RESULT=$(curl -s -X POST http://${WSL_IP}:${PORT}/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@quantumtrade.ai","password":"admin123"}')
  LOGIN_STATUS=$?

  if [ $LOGIN_STATUS -eq 0 ] && [ -n "$LOGIN_RESULT" ] && [[ "$LOGIN_RESULT" == *"token"* ]]; then
    echo -e "${GREEN}✅ Login endpoint accessible via WSL IP${NC}"
  else
    echo -e "${RED}❌ Login endpoint NOT accessible via WSL IP${NC}"
    echo -e "Response: $LOGIN_RESULT"
  fi
else
  echo -e "${RED}❌ Could not determine WSL IP address${NC}"
fi

echo -e "\n${BLUE}=== Authentication API Test Complete ===${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo -e "  • Make sure the server is running on port ${PORT}"
echo -e "  • For WSL users, try accessing via http://${WSL_IP}:${PORT}"
echo -e "  • Check browser console for connection errors"
echo -e "  • Verify CORS settings in server/index.ts"

# Provide next steps
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Start the server: ${GREEN}cd server && npm run dev${NC}"
echo -e "2. Start the client: ${GREEN}cd client && npm run dev${NC}"
echo -e "3. Access the app:  ${GREEN}http://localhost:5173${NC}"