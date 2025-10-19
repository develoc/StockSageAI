#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
  echo -e "${BLUE}Usage: $0 [OPTION]${NC}"
  echo -e "Run and test minimal auth server"
  echo
  echo -e "Options:"
  echo -e "  ${YELLOW}-e, --esm${NC}       Run ESM version (default)"
  echo -e "  ${YELLOW}-c, --cjs${NC}       Run CommonJS version"
  echo -e "  ${YELLOW}-t, --test-only${NC} Only run tests against a running server"
  echo -e "  ${YELLOW}-h, --help${NC}      Show this help message"
  echo
}

# Parse command line arguments
SERVER_TYPE="esm"
TEST_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--esm)
      SERVER_TYPE="esm"
      shift
      ;;
    -c|--cjs)
      SERVER_TYPE="cjs"
      shift
      ;;
    -t|--test-only)
      TEST_ONLY=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

if [ "$TEST_ONLY" = false ]; then
  # Start the server
  if [ "$SERVER_TYPE" = "esm" ]; then
    echo -e "${BLUE}Starting ESM server in background...${NC}"
    node minimal-auth-server.js > server-output.log 2>&1 &
  else
    echo -e "${BLUE}Starting CommonJS server in background...${NC}"
    node minimal-auth-server.cjs > server-output.log 2>&1 &
  fi
  
  SERVER_PID=$!
  echo -e "${GREEN}Server started with PID: $SERVER_PID${NC}"
  
  # Wait for server to start
  echo -e "${YELLOW}Waiting for server to start...${NC}"
  sleep 3
  
  # Check if server is running
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}Server failed to start. Check server-output.log for details.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Server is running!${NC}"
fi

# Run the tests
echo -e "${BLUE}Running API tests...${NC}"
./test-auth-endpoints.sh

if [ "$TEST_ONLY" = false ]; then
  # Ask if user wants to keep the server running
  echo
  read -p "Keep server running? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Stopping server (PID: $SERVER_PID)...${NC}"
    kill $SERVER_PID
    echo -e "${GREEN}Server stopped.${NC}"
  else
    echo -e "${GREEN}Server is still running with PID: $SERVER_PID${NC}"
    echo -e "${YELLOW}To stop it later, run: kill $SERVER_PID${NC}"
  fi
fi