#!/bin/bash

# Initialize everything
echo "=== QuantumTrade AI System Startup ==="

# Step 1: Ensure PostgreSQL is running and configured
echo -e "\n[1/5] Ensuring PostgreSQL is running..."
chmod +x ./ensure-postgresql.sh
./ensure-postgresql.sh

if [ $? -ne 0 ]; then
  echo "ERROR: PostgreSQL setup failed. Aborting."
  exit 1
fi

# Step 2: Initialize database schema and seed data if needed
echo -e "\n[2/5] Initializing database schema..."
chmod +x ./init-db.sh
./init-db.sh

if [ $? -ne 0 ]; then
  echo "ERROR: Database initialization failed. Aborting."
  exit 1
fi

# Step 3: Start the backend server in the background
echo -e "\n[3/5] Starting backend server..."
export PORT=3000
export NODE_ENV=development
export SERVER_HOST=0.0.0.0
export DEBUG=true

# Make sure required dependencies are installed
echo "Checking for required dependencies..."
npm list cors bcryptjs jsonwebtoken > /dev/null 2>&1 || {
    echo "Installing required dependencies..."
    npm install cors bcryptjs jsonwebtoken --legacy-peer-deps
}

# Start the server in the background
npx nodemon --exec "tsx server/index.ts" --watch server --ext ts,js &
SERVER_PID=$!

# Print server PID for troubleshooting
echo "Backend server started with PID: $SERVER_PID"

# Sleep to give the server time to start
echo "Waiting for server to start..."
sleep 5

# Step 4: Verify that the server started successfully
echo -e "\n[4/5] Verifying server health..."
SERVER_HEALTH=$(curl -s http://localhost:3000/api/health || echo '{"status": "error"}')

if ! echo $SERVER_HEALTH | grep -q '"status"'; then
  echo "ERROR: Server health check failed. Server may not be running properly."
  echo "Try running 'npm run dev:server' separately to see detailed error logs."
  # Don't exit, still try to start the client
else
  echo "Server health check successful!"
fi

# Step 5: Start the client
echo -e "\n[5/5] Starting client application..."
cd client
npx vite --host --port 5000

# Save the client's PID
CLIENT_PID=$!

# Handle cleanup when script is terminated
function cleanup {
  echo "Shutting down services..."
  
  # Kill the server process
  if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping server (PID: $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null
  fi
  
  # Kill the client process
  if [ ! -z "$CLIENT_PID" ]; then
    echo "Stopping client (PID: $CLIENT_PID)..."
    kill $CLIENT_PID 2>/dev/null
  fi
  
  echo "Shutdown complete."
}

# Register the cleanup function to be called on exit
trap cleanup EXIT

# Keep script running
wait $CLIENT_PID