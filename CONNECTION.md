# QuantumTrade AI Connection Guide

This guide will help you properly set up and verify the connection between your frontend and backend servers.

## Port Configuration

- **Backend Server**: Runs on port 3000
- **Frontend Client**: Runs on port 5000

## Starting the Servers

### Method 1: Start Both Simultaneously

```bash
npm run dev
```

This will start both the frontend and backend servers in parallel.

### Method 2: Start Each Server Separately

To start the backend server only:

```bash
npm run dev:server
```

or use our dedicated server script:

```bash
npm run server
```

To start the frontend client only:

```bash
npm run dev:client
```

## Verifying Connection

Run our verification tool to check if both servers are running properly:

```bash
npm run verify
```

## Troubleshooting

If you're experiencing connection issues:

### 1. Check Backend Server Logs

- Make sure there are no errors when starting the server
- Look for "serving on port 3000" in the logs to confirm the server started successfully
- Check if the marketDataService and strategyAnalysisService were initialized successfully

### 2. Check Network Connection

- Ensure port 3000 isn't blocked by a firewall
- Try accessing the API directly in a browser: `http://localhost:3000/api/health`

### 3. Check Frontend Proxy Configuration

The proxy in vite.config.ts should point to `http://localhost:3000` for API requests.

### 4. Common Issues

- **ECONNREFUSED**: Backend server is not running or cannot be accessed
- **CORS Errors**: CORS is not properly configured in the backend
- **404 Not Found**: API endpoint does not exist or route is misspelled

## Manual Server Start (Alternative Method)

If you're still having issues, try starting the server with these explicit commands in PowerShell:

```powershell
# Start backend
cd c:\Users\root\Documents\Projects\StockSageAI
$env:PORT = 3000
$env:NODE_ENV = "development"
npx tsx server/index.ts

# In another terminal, start frontend
cd c:\Users\root\Documents\Projects\StockSageAI\client
npx vite --port 5000
```

This approach ensures the environment variables are explicitly set.
