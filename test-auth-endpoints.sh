#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
SERVER_URL="http://localhost:3000"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    Authentication Server API Test Script      ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
health_response=$(curl -s -w "\n%{http_code}" ${SERVER_URL}/api/health)
health_status=$(echo "$health_response" | tail -n1)
health_body=$(echo "$health_response" | sed '$d')

if [ "$health_status" -eq 200 ]; then
  echo -e "${GREEN}✓ Health endpoint: Status 200 OK${NC}"
  echo "Response:"
  echo "$health_body" | python -m json.tool
else
  echo -e "${RED}✗ Health endpoint failed: Status $health_status${NC}"
  echo "Response:"
  echo "$health_body"
fi
echo

# Test login endpoint
echo -e "${YELLOW}Testing login endpoint...${NC}"
login_response=$(curl -s -w "\n%{http_code}" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quantumtrade.ai","password":"admin123"}' \
  ${SERVER_URL}/api/auth/login)
login_status=$(echo "$login_response" | tail -n1)
login_body=$(echo "$login_response" | sed '$d')

if [ "$login_status" -eq 200 ]; then
  echo -e "${GREEN}✓ Login endpoint: Status 200 OK${NC}"
  echo "Response:"
  echo "$login_body" | python -m json.tool
  
  # Extract token for further tests
  token=$(echo "$login_body" | python -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")
  
  # Test user endpoint with the token
  echo -e "\n${YELLOW}Testing user endpoint with token...${NC}"
  user_response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $token" \
    ${SERVER_URL}/api/auth/user)
  user_status=$(echo "$user_response" | tail -n1)
  user_body=$(echo "$user_response" | sed '$d')
  
  if [ "$user_status" -eq 200 ]; then
    echo -e "${GREEN}✓ User endpoint: Status 200 OK${NC}"
    echo "Response:"
    echo "$user_body" | python -m json.tool
  else
    echo -e "${RED}✗ User endpoint failed: Status $user_status${NC}"
    echo "Response:"
    echo "$user_body"
  fi
  
  # Test logout endpoint
  echo -e "\n${YELLOW}Testing logout endpoint...${NC}"
  logout_response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $token" \
    -X POST \
    ${SERVER_URL}/api/auth/logout)
  logout_status=$(echo "$logout_response" | tail -n1)
  logout_body=$(echo "$logout_response" | sed '$d')
  
  if [ "$logout_status" -eq 200 ]; then
    echo -e "${GREEN}✓ Logout endpoint: Status 200 OK${NC}"
    echo "Response:"
    echo "$logout_body" | python -m json.tool
  else
    echo -e "${RED}✗ Logout endpoint failed: Status $logout_status${NC}"
    echo "Response:"
    echo "$logout_body"
  fi
else
  echo -e "${RED}✗ Login endpoint failed: Status $login_status${NC}"
  echo "Response:"
  echo "$login_body"
fi

echo -e "\n${BLUE}===============================================${NC}"
echo -e "${BLUE}             Test Script Completed              ${NC}"
echo -e "${BLUE}===============================================${NC}"