# WSL Connection Troubleshooting Guide

## Understanding the Error

The error `connect ECONNREFUSED 127.0.0.1:3000` occurs when your frontend application can't connect to the backend server running on port 3000. This is especially common in Windows Subsystem for Linux (WSL) environments due to network isolation between Windows and the Linux subsystem.

## Quick Solutions

1. **Run both frontend and backend in the same environment**:
   - Either both in Windows, or both in WSL

2. **Use the WSL helper script**:
   ```bash
   chmod +x ./wsl-helper.sh
   ./wsl-helper.sh
   ```

3. **Use WSL IP directly**:
   - Get your WSL IP with `hostname -I`
   - Update the proxy target in `client/vite.config.ts` to use this IP

## Step-by-Step Troubleshooting

### 1. Check Server Status

First, verify if the server is actually running:

```bash
curl http://localhost:3000/api/health
```

If this fails, the server isn't running or isn't accessible.

### 2. Network Configuration

WSL2 uses a virtualized network adapter, which can cause connectivity issues:

- **From WSL to Windows**: Use the host IP (typically the default gateway)
  ```bash
  WINDOWS_HOST=$(ip route | grep default | awk '{print $3}')
  curl http://$WINDOWS_HOST:3000/api/health
  ```

- **From Windows to WSL**: Use the WSL IP
  ```bash
  # In WSL, get your IP:
  hostname -I
  # In Windows, use that IP to connect
  ```

### 3. Firewall Settings

Windows Firewall can block WSL connections:

1. Open Windows Defender Firewall
2. Allow incoming connections on ports 3000 and 5000
3. Ensure Windows Defender is not blocking Node.js

### 4. Port Binding

Ensure both applications bind to all interfaces:

- For the backend:
  ```
  SERVER_HOST=0.0.0.0 PORT=3000 npm run dev:server
  ```

- For the frontend:
  ```
  cd client && VITE_DEV_SERVER_HOST=0.0.0.0 npm run dev
  ```

### 5. Environment Variable Solutions

Create or modify these files:

1. `client/.env.local`:
   ```
   VITE_DEV_SERVER_HOST=0.0.0.0
   ```

2. `server/.env`:
   ```
   SERVER_HOST=0.0.0.0
   PORT=3000
   ```

## WSL-Specific Start Commands

### Starting the Backend in WSL

```bash
cd /path/to/StockSageAI
export SERVER_HOST=0.0.0.0
export PORT=3000
npm run dev:server
```

### Starting the Frontend in WSL

```bash
cd /path/to/StockSageAI/client
export VITE_DEV_SERVER_HOST=0.0.0.0
npm run dev
```

### Using the WSL Startup Script

```bash
chmod +x ./start-wsl.sh
./start-wsl.sh
```

## Cross-Environment Access

### Accessing WSL Services from Windows

1. Get your WSL IP address:
   ```bash
   hostname -I
   ```

2. In your Windows browser, visit:
   - Frontend: `http://<WSL-IP>:5000`
   - Backend: `http://<WSL-IP>:3000/api/health`

### Accessing Windows Services from WSL

1. Get your Windows host IP:
   ```bash
   ip route | grep default | awk '{print $3}'
   ```

2. In WSL, access:
   - Frontend: `http://<WINDOWS-IP>:5000`
   - Backend: `http://<WINDOWS-IP>:3000/api/health`

## Still Having Issues?

Run the diagnostic tool:

```bash
./wsl-helper.sh
```

This will provide detailed information about your network configuration and connectivity status.
