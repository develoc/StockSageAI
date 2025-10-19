#!/bin/bash

# Simple WSL quick fix script using only basic Linux commands
# Use this if you're having connection issues in WSL

echo "=== Quantum Trade WSL Quick Fix ==="
echo

# Get Windows host IP using Linux command
echo "Finding Windows host IP..."
HOST_IP=$(ip route | grep default | awk '{print $3}' 2>/dev/null || echo "172.17.0.1")
echo "Using host IP: $HOST_IP"
echo

# Update client config
echo "Updating client environment..."
mkdir -p ./client
echo "HOST_IP=$HOST_IP" > ./client/.env
echo "VITE_DEV_SERVER_HOST=0.0.0.0" >> ./client/.env
echo

# Check if ports are in use
echo "Checking for processes using ports 3000 and 5000..."
lsof -i :3000 || echo "No process using port 3000"
lsof -i :5000 || echo "No process using port 5000"
echo

# Start both servers
echo "Starting backend server..."
PORT=3000 HOST=0.0.0.0 npm run dev:server > server.log 2>&1 &
echo "Backend started! Check server.log for details"
echo

echo "Waiting for backend to initialize..."
sleep 5
echo

echo "Starting frontend client..."
cd client && HOST_IP=$HOST_IP npm run dev > ../client.log 2>&1 &
echo "Frontend started! Check client.log for details"
echo

echo "=== Services started ==="
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5000"
echo
echo "To stop the services:"
echo "kill \$(lsof -t -i:3000) \$(lsof -t -i:5000)"
