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
echo -e "${BLUE}    Enhanced Server Test Script                ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo

# Test direct health endpoint
echo -e "${YELLOW}Testing direct health endpoint (/health)...${NC}"
direct_health_response=$(curl -s -w "\n%{http_code}" ${SERVER_URL}/health)
direct_health_status=$(echo "$direct_health_response" | tail -n1)
direct_health_body=$(echo "$direct_health_response" | sed '$d')

if [ "$direct_health_status" -eq 200 ]; then
  echo -e "${GREEN}✓ Direct health endpoint: Status 200 OK${NC}"
  echo "Response:"
  echo "$direct_health_body" | python -m json.tool 2>/dev/null || echo "$direct_health_body"
else
  echo -e "${RED}✗ Direct health endpoint failed: Status $direct_health_status${NC}"
  echo "Response:"
  echo "$direct_health_body"
fi
echo

# Test API health endpoint
echo -e "${YELLOW}Testing API health endpoint (/api/health)...${NC}"
api_health_response=$(curl -s -w "\n%{http_code}" ${SERVER_URL}/api/health)
api_health_status=$(echo "$api_health_response" | tail -n1)
api_health_body=$(echo "$api_health_response" | sed '$d')

if [ "$api_health_status" -eq 200 ]; then
  echo -e "${GREEN}✓ API health endpoint: Status 200 OK${NC}"
  echo "Response:"
  echo "$api_health_body" | python -m json.tool 2>/dev/null || echo "$api_health_body"
else
  echo -e "${RED}✗ API health endpoint failed: Status $api_health_status${NC}"
  echo "Response:"
  echo "$api_health_body"
fi
echo

# Try some other endpoints to see what's running
echo -e "${YELLOW}Testing other possible endpoints...${NC}"

# Test API auth login endpoint
echo -e "${YELLOW}Testing login endpoint (/api/auth/login)...${NC}"
login_response=$(curl -s -w "\n%{http_code}" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quantumtrade.ai","password":"admin123"}' \
  ${SERVER_URL}/api/auth/login)
login_status=$(echo "$login_response" | tail -n1)
login_body=$(echo "$login_response" | sed '$d')

if [ "$login_status" -eq 200 ]; then
  echo -e "${GREEN}✓ Login endpoint: Status 200 OK${NC}"
  echo "Response:"
  echo "$login_body" | python -m json.tool 2>/dev/null || echo "$login_body"
else
  echo -e "${RED}✗ Login endpoint failed: Status $login_status${NC}"
  echo "Response:"
  echo "$login_body"
fi
echo

# Test direct auth login endpoint (without /api prefix)
echo -e "${YELLOW}Testing direct login endpoint (/auth/login)...${NC}"
direct_login_response=$(curl -s -w "\n%{http_code}" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quantumtrade.ai","password":"admin123"}' \
  ${SERVER_URL}/auth/login)
direct_login_status=$(echo "$direct_login_response" | tail -n1)
direct_login_body=$(echo "$direct_login_response" | sed '$d')

if [ "$direct_login_status" -eq 200 ]; then
  echo -e "${GREEN}✓ Direct login endpoint: Status 200 OK${NC}"
  echo "Response:"
  echo "$direct_login_body" | python -m json.tool 2>/dev/null || echo "$direct_login_body"
else
  echo -e "${RED}✗ Direct login endpoint failed: Status $direct_login_status${NC}"
  echo "Response:"
  echo "$direct_login_body"
fi

# Test for FastAPI docs
echo -e "\n${YELLOW}Testing for FastAPI docs (/docs)...${NC}"
docs_response=$(curl -s -w "\n%{http_code}" -o /dev/null ${SERVER_URL}/docs)
docs_status=$(echo "$docs_response" | tail -n1)

if [ "$docs_status" -eq 200 ]; then
  echo -e "${GREEN}✓ FastAPI docs found: Status 200 OK${NC}"
  echo "FastAPI appears to be running at $SERVER_URL/docs"
else
  echo -e "${RED}✗ FastAPI docs not found: Status $docs_status${NC}"
fi

echo -e "\n${BLUE}===============================================${NC}"
echo -e "${BLUE}             Test Script Completed              ${NC}"
echo -e "${BLUE}===============================================${NC}"