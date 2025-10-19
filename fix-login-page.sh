#!/bin/bash

# Fix Login Page Issues Script

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}==========================================${RESET}"
echo -e "${BOLD}${BLUE}   StockSageAI Login Page Troubleshooter   ${RESET}"
echo -e "${BOLD}${BLUE}==========================================${RESET}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Check if the server is running
echo -e "\n${BOLD}${YELLOW}[1/5] Checking if the server is running...${RESET}"
SERVER_RUNNING=0
curl -s http://localhost:3000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Server is running on port 3000${RESET}"
    SERVER_RUNNING=1
else
    echo -e "${RED}✗ Server is not running on port 3000${RESET}"
    echo -e "${YELLOW}Attempting to start the server...${RESET}"
    
    # Try to start the server in the background
    NODE_ENV=development PORT=3000 tsx server/index.ts > server-logs.txt 2>&1 &
    SERVER_PID=$!
    echo -e "${GREEN}Server starting with PID: $SERVER_PID${RESET}"
    echo -e "${YELLOW}Waiting for server to initialize...${RESET}"
    sleep 5
    
    # Check if server started successfully
    curl -s http://localhost:3000/api/health > /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Server started successfully${RESET}"
        SERVER_RUNNING=1
    else
        echo -e "${RED}✗ Server failed to start${RESET}"
        echo -e "${YELLOW}Check server-logs.txt for details${RESET}"
    fi
fi

# Step 2: Test the auth endpoint directly
echo -e "\n${BOLD}${YELLOW}[2/5] Testing the authentication endpoint...${RESET}"
if [ $SERVER_RUNNING -eq 1 ]; then
    AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@quantumtrade.ai","password":"admin123"}')
    
    echo $AUTH_RESPONSE | grep -q "token"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Authentication endpoint is working${RESET}"
    else
        echo -e "${RED}✗ Authentication endpoint returned error${RESET}"
        echo -e "${YELLOW}Response: $AUTH_RESPONSE${RESET}"
        
        # If 404 error, check if auth routes are properly registered
        if echo $AUTH_RESPONSE | grep -q "Not Found" || echo $AUTH_RESPONSE | grep -q "404"; then
            echo -e "${RED}The API endpoint appears to be missing${RESET}"
            echo -e "${YELLOW}Running test authentication server instead...${RESET}"
            
            # Kill current server if it's running
            if [ $SERVER_RUNNING -eq 1 ] && [ ! -z "$SERVER_PID" ]; then
                kill $SERVER_PID 2>/dev/null
            fi
            
            # Run the test auth server
            PORT=3000 node test-auth-server.mjs > test-auth-logs.txt 2>&1 &
            TEST_SERVER_PID=$!
            echo -e "${GREEN}Test auth server started with PID: $TEST_SERVER_PID${RESET}"
            echo -e "${YELLOW}Waiting for test server to initialize...${RESET}"
            sleep 3
            
            # Verify test server
            curl -s http://localhost:3000/api/health > /dev/null
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Test auth server is running${RESET}"
                SERVER_RUNNING=2  # Using test server
            else
                echo -e "${RED}✗ Test auth server failed to start${RESET}"
                echo -e "${YELLOW}Check test-auth-logs.txt for details${RESET}"
            fi
        fi
    fi
fi

# Step 3: Check client app configuration
echo -e "\n${BOLD}${YELLOW}[3/5] Checking client app configuration...${RESET}"
if [ -f "./client/src/lib/axiosClient.ts" ]; then
    echo -e "${GREEN}✓ Found axios client configuration${RESET}"
    
    # Check for proper WSL host detection
    grep -q "For Windows host accessing WSL" ./client/src/lib/axiosClient.ts
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ WSL host detection is configured${RESET}"
    else
        echo -e "${YELLOW}! WSL host detection might need improvement${RESET}"
    fi
else
    echo -e "${RED}✗ Could not find axios client configuration${RESET}"
fi

# Step 4: Verify theme configuration
echo -e "\n${BOLD}${YELLOW}[4/5] Verifying theme configuration...${RESET}"
if [ -f "./client/src/index.css" ]; then
    echo -e "${GREEN}✓ Found CSS theme file${RESET}"
    
    # Check if quantum theme variables are defined
    grep -q "quantum-accent" ./client/src/index.css
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Quantum theme colors are defined${RESET}"
    else
        echo -e "${RED}✗ Quantum theme colors are missing${RESET}"
    fi
else
    echo -e "${RED}✗ Could not find CSS theme file${RESET}"
fi

# Step 5: Check logo component
echo -e "\n${BOLD}${YELLOW}[5/5] Checking logo component...${RESET}"
if [ -f "./client/src/components/ui/logo.tsx" ]; then
    echo -e "${GREEN}✓ Found logo component${RESET}"
    
    # Check for fallback styles
    grep -q "inlineStyle" ./client/src/components/ui/logo.tsx
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Logo has fallback inline styles${RESET}"
    else
        echo -e "${YELLOW}! Logo might not have fallback styles${RESET}"
    fi
else
    echo -e "${RED}✗ Could not find logo component${RESET}"
fi

# Summary and solution
echo -e "\n${BOLD}${BLUE}==========================================${RESET}"
echo -e "${BOLD}${BLUE}              Summary                      ${RESET}"
echo -e "${BOLD}${BLUE}==========================================${RESET}"

if [ $SERVER_RUNNING -eq 0 ]; then
    echo -e "${RED}✗ Server is not running${RESET}"
    echo -e "${YELLOW}Please start the server using:${RESET}"
    echo -e "  ${BOLD}npm run dev:server${RESET}"
    echo -e "  or"
    echo -e "  ${BOLD}./start-server.js${RESET}"
elif [ $SERVER_RUNNING -eq 1 ]; then
    echo -e "${GREEN}✓ Main server is running${RESET}"
elif [ $SERVER_RUNNING -eq 2 ]; then
    echo -e "${YELLOW}! Using test authentication server${RESET}"
fi

# Provide instructions for the user
echo -e "\n${BOLD}To fix login issues:${RESET}"
echo -e "1. Ensure server is running (port 3000)"
echo -e "2. Start client in a separate terminal:"
echo -e "   ${BOLD}cd client && npm run dev${RESET}"
echo -e "3. If login fails, use test server:"
echo -e "   ${BOLD}PORT=3000 node test-auth-server.mjs${RESET}"
echo -e "4. Use credentials:"
echo -e "   ${BOLD}admin@quantumtrade.ai / admin123${RESET}"

echo -e "\n${BOLD}${BLUE}==========================================${RESET}"