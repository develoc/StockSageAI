#!/bin/bash

# Quantum Trade WSL Diagnostic Tool
# This script uses only Linux commands to diagnose connection issues in WSL

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Quantum Trade WSL Diagnostic Tool ===${NC}"
echo

# Check if we're in WSL
echo -e "${YELLOW}Checking environment:${NC}"
if grep -q Microsoft /proc/version; then
  echo -e "${GREEN}✓ Running in WSL${NC}"
  WSL_VERSION=$(grep -oP '(?<=Microsoft-)[0-9]+' /proc/version 2>/dev/null || echo "Unknown")
  echo -e "  WSL Version: $WSL_VERSION"
else
  echo -e "${RED}✗ Not running in WSL${NC}"
  echo -e "  This script is designed for WSL environments"
fi
echo

# Check network configuration
echo -e "${YELLOW}Network configuration:${NC}"
echo -e "WSL IP: $(hostname -I | awk '{print $1}')"

WINDOWS_HOST=$(ip route | grep default | awk '{print $3}' 2>/dev/null || echo "Could not detect")
echo -e "Windows Host IP: ${GREEN}${WINDOWS_HOST}${NC}"

echo -e "\nNetwork interfaces:"
ip -brief address show

echo -e "\nRouting table:"
ip route
echo

# Check DNS configuration
echo -e "${YELLOW}DNS configuration:${NC}"
echo -e "$(cat /etc/resolv.conf)"
echo

# Check port availability
echo -e "${YELLOW}Port availability:${NC}"
echo -e "Checking backend port (3000):"
if netstat -tuln | grep -q ":3000 "; then
  echo -e "${RED}✗ Port 3000 is in use${NC}"
  echo -e "Process using port 3000:"
  lsof -i :3000 || echo -e "${RED}Could not determine process${NC}"
else
  echo -e "${GREEN}✓ Port 3000 is available${NC}"
fi

echo -e "\nChecking frontend port (5000):"
if netstat -tuln | grep -q ":5000 "; then
  echo -e "${RED}✗ Port 5000 is in use${NC}"
  echo -e "Process using port 5000:"
  lsof -i :5000 || echo -e "${RED}Could not determine process${NC}"
else
  echo -e "${GREEN}✓ Port 5000 is available${NC}"
fi
echo

# Check connectivity
echo -e "${YELLOW}Connectivity tests:${NC}"
echo -e "Testing connection to backend (localhost:3000):"
if curl -s --connect-timeout 2 http://localhost:3000/api/health > /dev/null; then
  echo -e "${GREEN}✓ Connected to backend at localhost:3000${NC}"
else
  echo -e "${RED}✗ Failed to connect to backend at localhost:3000${NC}"
fi

echo -e "\nTesting connection to Windows host (${WINDOWS_HOST}:3000):"
if curl -s --connect-timeout 2 http://${WINDOWS_HOST}:3000/api/health > /dev/null; then
  echo -e "${GREEN}✓ Connected to backend at ${WINDOWS_HOST}:3000${NC}"
else
  echo -e "${RED}✗ Failed to connect to backend at ${WINDOWS_HOST}:3000${NC}"
fi

echo -e "\nTesting connection to frontend (localhost:5000):"
if curl -s --connect-timeout 2 http://localhost:5000 > /dev/null; then
  echo -e "${GREEN}✓ Connected to frontend at localhost:5000${NC}"
else
  echo -e "${RED}✗ Failed to connect to frontend at localhost:5000${NC}"
fi
echo

# Check Node.js environment
echo -e "${YELLOW}Node.js environment:${NC}"
echo -e "Node version: $(node -v 2>/dev/null || echo 'Not installed')"
echo -e "NPM version: $(npm -v 2>/dev/null || echo 'Not installed')"
echo

# Check project configuration
echo -e "${YELLOW}Project configuration:${NC}"
if [ -f ./client/vite.config.ts ]; then
  echo -e "${GREEN}✓ Found client/vite.config.ts${NC}"
  echo -e "\nProxy configuration:"
  grep -A 10 "proxy:" ./client/vite.config.ts
else
  echo -e "${RED}✗ Could not find client/vite.config.ts${NC}"
fi
echo

# Show running node processes
echo -e "${YELLOW}Running Node processes:${NC}"
ps aux | grep -E "[n]ode|[n]pm" || echo -e "${RED}No Node processes found${NC}"
echo

# Recommendations
echo -e "${CYAN}=== Recommendations ===${NC}"
echo -e "If you're having connection issues, try these Linux commands:"
echo
echo -e "1. ${YELLOW}Kill any processes using required ports:${NC}"
echo -e "   ${CYAN}sudo kill \$(sudo lsof -t -i:3000) 2>/dev/null || true${NC}"
echo -e "   ${CYAN}sudo kill \$(sudo lsof -t -i:5000) 2>/dev/null || true${NC}"
echo
echo -e "2. ${YELLOW}Start the backend with correct host binding:${NC}"
echo -e "   ${CYAN}cd $(pwd) && PORT=3000 HOST=0.0.0.0 npm run dev:server${NC}"
echo
echo -e "3. ${YELLOW}Start the frontend with correct host configuration:${NC}"
echo -e "   ${CYAN}cd $(pwd)/client && HOST_IP=${WINDOWS_HOST} VITE_DEV_SERVER_HOST=0.0.0.0 npm run dev${NC}"
echo
echo -e "4. ${YELLOW}Use the quick-fix script:${NC}"
echo -e "   ${CYAN}chmod +x ./quick-fix.sh && ./quick-fix.sh${NC}"
echo
echo -e "${CYAN}=== End of Diagnostic Report ===${NC}"
