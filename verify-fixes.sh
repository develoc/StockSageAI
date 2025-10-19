#!/bin/bash

# Test script to verify fixes for both the NaN values, user registration issues, and API connections

# Text styling
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Quantum Trade Fix Verification =====${NC}"
echo

# Function to make an API request
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  if [ -n "$data" ]; then
    curl -s -X $method http://localhost:3000$endpoint \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -s -X $method http://localhost:3000$endpoint
  fi
}

# 1. Test health endpoint to verify server is running
echo "1. Testing server health..."
health_response=$(make_request "GET" "/api/health")
if [[ $health_response == *"status"* && $health_response == *"ok"* ]]; then
  echo "✅ Server is running"
else
  echo "❌ Server is not running or health endpoint returned unexpected response"
  echo "Response: $health_response"
  exit 1
fi
echo

# 2. Test user registration to verify UUID fix
echo "2. Testing user registration with UUID fix..."
# Generate a random email to avoid conflicts
random_str=$(head /dev/urandom | tr -dc a-z0-9 | head -c 8)
email="test_${random_str}@example.com"

register_data='{
  "firstName": "Test",
  "lastName": "User",
  "email": "'$email'",
  "password": "Password123!"
}'

register_response=$(make_request "POST" "/api/auth/register" "$register_data")

if [[ $register_response == *"token"* && $register_response != *"error"* ]]; then
  echo "✅ User registration successful"
  # Extract token for subsequent requests
  token=$(echo $register_response | grep -o '"token":"[^"]*' | sed 's/"token":"//')
else
  echo "❌ User registration failed"
  echo "Response: $register_response"
fi
echo

# 3. Test market data endpoints to verify NaN fix
echo "3. Testing market data endpoint for OIL commodity..."
market_response=$(make_request "GET" "/api/market-data/OIL?timeframe=1D" "")

if [[ $market_response == *"symbol"* && $market_response == *"OIL"* ]]; then
  echo "✅ Market data endpoint working"
  
  # Check for NaN values
  if [[ $market_response == *"NaN"* ]]; then
    echo "❌ NaN values still present in the response"
  else
    echo "✅ No NaN values found in the response"
  fi
else
  echo "❌ Market data endpoint failed"
  echo "Response: $market_response"
fi

echo
echo -e "${YELLOW}4. Testing API connections...${NC}"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "Environment variables loaded from .env file"
else
  echo -e "${RED}No .env file found. Using default API keys.${NC}"
fi

# Test Alpha Vantage API
echo -e "\n${YELLOW}Testing Alpha Vantage API...${NC}"
ALPHA_RESPONSE=$(curl -s "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=${ALPHA_VANTAGE_API_KEY:-RZ1QB6NQJ5P85SPN}")

if echo "$ALPHA_RESPONSE" | grep -q "Time Series"; then
  echo -e "${GREEN}✅ Alpha Vantage API connection successful${NC}"
else
  echo -e "${RED}❌ Alpha Vantage API connection failed${NC}"
  echo -e "Error response: $(echo "$ALPHA_RESPONSE" | grep -m 1 "Error")"
fi

# Test CoinGecko API
echo -e "\n${YELLOW}Testing CoinGecko API...${NC}"
COINGECKO_RESPONSE=$(curl -s -H "x-cg-pro-api-key: ${COINGECKO_API_KEY:-CG-Ded7kEhNFRRoLoLqF5jRtXzH}" "https://pro-api.coingecko.com/api/v3/ping")

if echo "$COINGECKO_RESPONSE" | grep -q "gecko_says"; then
  echo -e "${GREEN}✅ CoinGecko API connection successful${NC}"
else
  echo -e "${RED}❌ CoinGecko API connection failed${NC}"
  echo -e "Error response: $COINGECKO_RESPONSE"
  
  # Try free API as fallback
  echo -e "\n${YELLOW}Trying CoinGecko free API as fallback...${NC}"
  COINGECKO_FREE_RESPONSE=$(curl -s "https://api.coingecko.com/api/v3/ping")
  
  if echo "$COINGECKO_FREE_RESPONSE" | grep -q "gecko_says"; then
    echo -e "${GREEN}✅ CoinGecko free API connection successful${NC}"
  else
    echo -e "${RED}❌ CoinGecko free API connection also failed${NC}"
  fi
fi

echo
echo -e "${YELLOW}===== Verification Complete =====${NC}"
