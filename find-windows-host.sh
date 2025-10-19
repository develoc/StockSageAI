#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================${NC}"
echo -e "${CYAN}   WSL to Windows Connection Helper   ${NC}"
echo -e "${CYAN}======================================${NC}"
echo ""

# Check if running in WSL
if ! grep -q Microsoft /proc/version; then
  echo -e "Not running in WSL environment. This script is intended for WSL only."
  exit 1
fi

echo -e "${YELLOW}Detecting network settings...${NC}"
echo ""

# Get WSL IP address
WSL_IP=$(hostname -I | awk '{print $1}')
echo -e "WSL IP Address: ${GREEN}${WSL_IP}${NC}"

# Methods to find Windows Host IP
echo -e "\nTrying multiple methods to find Windows host IP..."

# Method 1: Default route
echo -e "\n${CYAN}Method 1: Default gateway${NC}"
DEFAULT_ROUTE=$(ip route | grep default | awk '{print $3}')
echo -e "Windows host IP (default route): ${GREEN}${DEFAULT_ROUTE}${NC}"

# Method 2: From resolv.conf
echo -e "\n${CYAN}Method 2: Nameserver from resolv.conf${NC}"
NAMESERVER=$(grep nameserver /etc/resolv.conf | awk '{print $2}')
echo -e "Windows host IP (nameserver): ${GREEN}${NAMESERVER}${NC}"

# Method 3: Try common WSL2 gateway
echo -e "\n${CYAN}Method 3: Common WSL2 gateway${NC}"
echo -e "Possible Windows host IP: ${GREEN}172.17.0.1${NC}"

echo -e "\n${CYAN}Testing connections...${NC}"
# Test connection to backend through each detected IP
echo -e "\nTesting backend connection with default route (${DEFAULT_ROUTE}:3000):"
curl -s -o /dev/null -w "%{http_code}" http://${DEFAULT_ROUTE}:3000/api/health || echo "Connection failed"

echo -e "\nTesting backend connection with nameserver (${NAMESERVER}:3000):"
curl -s -o /dev/null -w "%{http_code}" http://${NAMESERVER}:3000/api/health || echo "Connection failed"

echo -e "\nTesting backend connection with common WSL gateway (172.17.0.1:3000):"
curl -s -o /dev/null -w "%{http_code}" http://172.17.0.1:3000/api/health || echo "Connection failed"

# Instructions for .env file
echo -e "\n${CYAN}======================================${NC}"
echo -e "${YELLOW}Instructions:${NC}"
echo -e "1. Add the working IP to your client/.env file:"
echo -e "   ${GREEN}WINDOWS_HOST_IP=x.x.x.x${NC}"
echo ""
echo -e "2. Then restart your frontend with:"
echo -e "   ${GREEN}cd client && npm run dev${NC}"
echo -e "${CYAN}======================================${NC}"
