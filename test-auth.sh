#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}===== Quantum Trade User Authentication Test =====${NC}"
echo

# Function to make an API request
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local auth=$4
  
  local headers="-H \"Content-Type: application/json\""
  if [ -n "$auth" ]; then
    headers="$headers -H \"Authorization: Bearer $auth\""
  fi
  
  if [ -n "$data" ]; then
    eval "curl -s -X $method http://localhost:3000$endpoint $headers -d '$data'"
  else
    eval "curl -s -X $method http://localhost:3000$endpoint $headers"
  fi
}

# 1. Test if the server is running
echo -e "${YELLOW}1. Testing server connection...${NC}"
health=$(make_request "GET" "/api/health" "")
if [[ $health == *"status"* && $health == *"ok"* ]]; then
  echo -e "${GREEN}✓ Server is running${NC}"
else
  echo -e "${RED}✗ Server is not responding${NC}"
  echo -e "${YELLOW}Make sure the server is running with: npm run dev:server${NC}"
  exit 1
fi
echo

# 2. Try logging in with predefined admin user
echo -e "${YELLOW}2. Testing admin login...${NC}"
admin_data='{
  "email": "admin@quantumtrade.ai",
  "password": "admin123"
}'

admin_response=$(make_request "POST" "/api/auth/login" "$admin_data")

if [[ $admin_response == *"token"* ]]; then
  echo -e "${GREEN}✓ Admin login successful${NC}"
  admin_token=$(echo $admin_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo -e "Token: ${admin_token:0:20}..."
else
  echo -e "${RED}✗ Admin login failed${NC}"
  echo -e "Response: $admin_response"
fi
echo

# 3. Try logging in with predefined user
echo -e "${YELLOW}3. Testing regular user login...${NC}"
user_data='{
  "email": "user@quantumtrade.ai",
  "password": "user123"
}'

user_response=$(make_request "POST" "/api/auth/login" "$user_data")

if [[ $user_response == *"token"* ]]; then
  echo -e "${GREEN}✓ Regular user login successful${NC}"
  user_token=$(echo $user_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo -e "Token: ${user_token:0:20}..."
else
  echo -e "${RED}✗ Regular user login failed${NC}"
  echo -e "Response: $user_response"
fi
echo

# 4. Test registration of a new user
echo -e "${YELLOW}4. Testing user registration...${NC}"
# Generate a random email to avoid conflicts
random_str=$(head /dev/urandom | tr -dc 'a-z0-9' | head -c 8)
test_email="test_${random_str}@example.com"

register_data="{
  \"firstName\": \"Test\",
  \"lastName\": \"User\",
  \"email\": \"$test_email\",
  \"password\": \"password123\"
}"

register_response=$(make_request "POST" "/api/auth/register" "$register_data")

if [[ $register_response == *"token"* ]]; then
  echo -e "${GREEN}✓ User registration successful${NC}"
  echo -e "Created user: $test_email"
else
  echo -e "${RED}✗ User registration failed${NC}"
  echo -e "Response: $register_response"
fi
echo

# Summary
echo -e "${CYAN}===== Test Summary =====${NC}"
if [[ $admin_response == *"token"* ]] && [[ $user_response == *"token"* ]] && [[ $register_response == *"token"* ]]; then
  echo -e "${GREEN}All tests passed! Authentication system is working.${NC}"
else
  echo -e "${RED}Some tests failed. Please check the logs above.${NC}"
fi
