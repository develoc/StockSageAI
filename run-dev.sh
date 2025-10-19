#!/bin/bash

# Simple script to start both client and server for development

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}${BLUE}   StockSageAI Development Starter    ${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Start the server
echo -e "\n${BOLD}${YELLOW}[1/2] Starting the server on port 3000...${RESET}"
NODE_ENV=development PORT=3000 npx tsx server/index.ts > server-logs.txt 2>&1 &
SERVER_PID=$!

echo -e "${GREEN}Server process started with PID: $SERVER_PID${RESET}"
echo -e "${YELLOW}Server logs are being written to: server-logs.txt${RESET}"

# Wait a bit for the server to start
echo -e "${YELLOW}Waiting for the server to initialize...${RESET}"
sleep 3

# Check if server started properly
curl -s http://localhost:3000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Server is running and responding!${RESET}"
else
    echo -e "${RED}✗ Server may not be running properly${RESET}"
    echo -e "${YELLOW}Check server-logs.txt for errors${RESET}"
    # Continue anyway to start the client
fi

# Step 2: Start the client
echo -e "\n${BOLD}${YELLOW}[2/2] Starting the client development server...${RESET}"
cd client
npm run dev > ../client-logs.txt 2>&1 &
CLIENT_PID=$!

echo -e "${GREEN}Client process started with PID: $CLIENT_PID${RESET}"
echo -e "${YELLOW}Client logs are being written to: client-logs.txt${RESET}"

# Wait a bit for the client to start
echo -e "${YELLOW}Waiting for the client to initialize...${RESET}"
sleep 3

# Summary
echo -e "\n${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}${GREEN}StockSageAI Development Environment${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}Access your application at:${RESET}"
echo -e "- Frontend: ${YELLOW}http://localhost:5173${RESET}"
echo -e "- Backend API: ${YELLOW}http://localhost:3000${RESET}"
echo -e "\n${BOLD}Log Files:${RESET}"
echo -e "- Server logs: ${YELLOW}server-logs.txt${RESET}"
echo -e "- Client logs: ${YELLOW}client-logs.txt${RESET}"
echo -e "\n${BOLD}Test Credentials:${RESET}"
echo -e "- Admin: ${YELLOW}admin@quantumtrade.ai / admin123${RESET}"
echo -e "- User: ${YELLOW}user@quantumtrade.ai / user123${RESET}"
echo -e "\n${BOLD}Process Management:${RESET}"
echo -e "- Server PID: ${YELLOW}$SERVER_PID${RESET}"
echo -e "- Client PID: ${YELLOW}$CLIENT_PID${RESET}"
echo -e "- To stop all processes: ${YELLOW}kill $SERVER_PID $CLIENT_PID${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}Press Ctrl+C to close this terminal (processes will continue running)${RESET}"

# Keep the script running but allow user to exit
wait