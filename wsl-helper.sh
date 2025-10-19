#!/bin/bash

# Print header
echo -e "\e[36m=============================================\e[0m"
echo -e "\e[36m   Quantum Trade WSL Connection Helper        \e[0m"
echo -e "\e[36m=============================================\e[0m"
echo ""

# Check if we're running in WSL
if grep -q Microsoft /proc/version; then
  echo -e "\e[32m✓ Running in WSL environment\e[0m"
else
  echo -e "\e[33m⚠ Not running in WSL. This script is optimized for WSL environments.\e[0m"
fi

# Display network information
echo ""
echo -e "\e[1mNetwork Configuration:\e[0m"
echo "-------------------------"

# Get WSL IP address
WSL_IP=$(hostname -I | awk '{print $1}')
echo -e "WSL IP Address: \e[33m$WSL_IP\e[0m"

# Get Windows Host IP (usually the default gateway)
WINDOWS_HOST=$(ip route | grep default | awk '{print $3}')
echo -e "Windows Host IP: \e[33m$WINDOWS_HOST\e[0m"

# Test connectivity to localhost:3000 (server) and localhost:5000 (client)
echo ""
echo -e "\e[1mConnectivity Tests:\e[0m"
echo "-------------------------"

echo -n "Testing backend (localhost:3000): "
if curl -s http://localhost:3000/api/health -m 2 > /dev/null; then
  echo -e "\e[32m✓ Connected\e[0m"
else
  echo -e "\e[31m✗ Failed\e[0m"
fi

echo -n "Testing backend (127.0.0.1:3000): "
if curl -s http://127.0.0.1:3000/api/health -m 2 > /dev/null; then
  echo -e "\e[32m✓ Connected\e[0m"
else
  echo -e "\e[31m✗ Failed\e[0m"
fi

echo -n "Testing backend ($WSL_IP:3000): "
if curl -s http://$WSL_IP:3000/api/health -m 2 > /dev/null; then
  echo -e "\e[32m✓ Connected\e[0m"
else
  echo -e "\e[31m✗ Failed\e[0m"
fi

echo -n "Testing frontend (localhost:5000): "
if curl -s http://localhost:5000 -m 2 > /dev/null; then
  echo -e "\e[32m✓ Connected\e[0m"
else
  echo -e "\e[31m✗ Failed\e[0m"
fi

# Check if server process is running
echo ""
echo -e "\e[1mProcess Check:\e[0m"
echo "-------------------------"
echo "Node processes:"
ps aux | grep node | grep -v grep

# Provide WSL-specific instructions
echo ""
echo -e "\e[1mWSL Connection Instructions:\e[0m"
echo "-------------------------"
echo -e "1. Start backend with: \e[33mnpm run server\e[0m"
echo -e "2. Start frontend with: \e[33mcd client && npm run dev\e[0m"
echo -e "3. Access the app at: \e[33mhttp://localhost:5000\e[0m"
echo ""
echo -e "If connections fail, try these WSL-specific fixes:"
echo -e "- Add to client/.env.local: \e[33mVITE_DEV_SERVER_HOST=0.0.0.0\e[0m"
echo -e "- Add to server/.env: \e[33mSERVER_HOST=0.0.0.0\e[0m"
echo -e "- In Windows, ensure WSL networking is not blocked by firewall"
echo ""
echo -e "\e[36m=============================================\e[0m"
