# StockSageAI Authentication Server

This is a lightweight authentication server for the StockSageAI application. It provides endpoints for user login, registration, and authentication verification.

## Overview

The authentication server is designed to work with the StockSageAI client application. It provides:
- User login and authentication
- JWT token generation and validation
- User session management
- Password hashing and verification

## Available Server Implementations

The project includes multiple authentication server implementations:

1. **FastAPI (Python)** - **RECOMMENDED**
   - Uses Python with FastAPI framework
   - Provides interactive API documentation
   - Simple and lightweight

2. **Node.js (JavaScript)**
   - ESM Version - Uses ES modules syntax
   - CommonJS Version - Uses CommonJS syntax

## Prerequisites

### For FastAPI Server (Recommended)
- Python 3.7 or higher
- Virtual environment (venv)

### For Node.js Server
- Node.js (v14 or higher)
- PostgreSQL database
- WSL2 if running on Windows (optional)

## Quick Start

### FastAPI Authentication Server (Recommended)

1. Make the script executable (first time only):
   ```bash
   chmod +x start-fastapi-auth.sh
   ```

2. Run the FastAPI authentication server:
   ```bash
   ./start-fastapi-auth.sh
   ```

3. Access the API documentation:
   ```
   http://localhost:3000/docs
   ```

4. Test the API endpoints:
   ```bash
   chmod +x test-fastapi-auth.sh
   ./test-fastapi-auth.sh
   ```

### Node.js Authentication Server

#### Windows

1. Open a Command Prompt or PowerShell terminal
2. Navigate to the StockSageAI project directory
3. Run the authentication server:

```
.\start-auth-server.bat
```

OR using PowerShell:

```powershell
.\start-auth-server.ps1
```

**For minimal test servers:**

ESM version:
```cmd
run-minimal-esm-server.bat
```

CommonJS version:
```cmd
run-minimal-cjs-server.bat
```

#### Linux/WSL

1. Open a terminal
2. Navigate to the StockSageAI project directory
3. Make the script executable (first time only):

```bash
chmod +x start-auth-server.sh
chmod +x run-minimal-esm-server.sh
chmod +x run-minimal-cjs-server.sh
chmod +x test-auth-endpoints.sh
```

4. Run the authentication server:

```bash
./start-auth-server.sh
```

**For minimal test servers:**

ESM version:
```bash
./run-minimal-esm-server.sh
```

CommonJS version:
```bash
./run-minimal-cjs-server.sh
```

## Configuration

The authentication server can be configured using environment variables in the `.env` file:

### Default Configuration

```
DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=3000
CORS_ORIGINS=http://localhost:5000,http://localhost:5173,http://127.0.0.1:5173
```

### Important Configuration Options

- `DATABASE_URL`: Connection string for the PostgreSQL database
- `JWT_SECRET`: Secret key used to sign JWT tokens (change this in production!)
- `PORT`: The port number the server will listen on (default: 3000)
- `CORS_ORIGINS`: Comma-separated list of allowed origins for CORS

## API Endpoints

### Authentication

- **POST /api/auth/login**
  - Authenticates a user and returns a JWT token
  - Request body: `{ "email": "user@example.com", "password": "password" }`

- **GET /api/auth/user**
  - Returns the current authenticated user's information
  - Requires Authorization header: `Bearer <token>`

- **POST /api/auth/logout**
  - Logs out the current user (client-side token removal)

### Health Check

- **GET /health**
  - Direct health check endpoint

- **GET /api/health**
  - API health check endpoint

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if the port 3000 is already in use
   - For Node.js: Verify the DATABASE_URL is correct in the .env file
   - For FastAPI: Make sure Python and required packages are installed

2. **Authentication fails**
   - For testing use the default admin credentials
   - Check if the token format is correct
   - Check server logs for detailed error messages

3. **CORS errors**
   - For production, update CORS settings in the server code
   - For testing, the servers allow all origins by default

4. **404 errors on API endpoints**
   - Make sure you're using the correct URL path format
   - Check if the server is running properly
   - Verify the endpoint path in the documentation
   - Try the FastAPI server which has interactive API docs:
     ```
     http://localhost:3000/docs
     ```
   - Use the test scripts to verify endpoints:
     ```bash
     ./test-fastapi-auth.sh
     ```

### Using the FastAPI Documentation

The FastAPI server includes interactive API documentation:

1. Start the FastAPI server: `./start-fastapi-auth.sh`
2. Open a web browser and navigate to: `http://localhost:3000/docs`
3. The documentation page allows you to:
   - See all available endpoints
   - Try out API calls directly in the browser
   - Understand the request and response formats
   - Authenticate with the login endpoint and use the token for protected endpoints

### Test with curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@quantumtrade.ai","password":"admin123"}' \
  http://localhost:3000/api/auth/login

# Get user info (replace TOKEN with the token from login response)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/auth/user
```

## Developer Notes

### FastAPI Server
- Built with Python and FastAPI framework
- Simple in-memory user authentication for testing
- Interactive API documentation with Swagger UI
- Base64 encoded tokens for client compatibility

### Node.js Server
- The server uses ES modules syntax (as indicated by `"type": "module"` in package.json)
- Password hashing is done with bcryptjs
- JWT tokens are valid for 7 days by default

## Available Test Servers

To help diagnose issues with the authentication server, we provide multiple implementations:

1. **FastAPI Version** (`fastapi_auth_server.py`) - RECOMMENDED
   - Uses Python with FastAPI framework
   - Includes interactive documentation
   - Simple setup and configuration

2. **Node.js ESM Version** (`minimal-auth-server.js`)
   - Uses ES modules syntax
   - Compatible with the project's default module system

3. **Node.js CommonJS Version** (`minimal-auth-server.cjs`)
   - Uses CommonJS syntax
   - Useful for testing if ES modules are causing issues

### Test User Credentials

For testing any of the authentication servers, use these credentials:
- Email: `admin@quantumtrade.ai`
- Password: `admin123`

### Running Tests

We provide test scripts to verify API endpoints:

```bash
# For FastAPI server
./test-fastapi-auth.sh

# For Node.js servers
./test-auth-endpoints.sh

# For Windows PowerShell
.\test-auth-endpoints.ps1
```