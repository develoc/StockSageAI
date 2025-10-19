@echo off
color 0B
echo =====================================
echo       Auth Server Startup Script
echo =====================================

:: Check if the .env file exists
if not exist ".env" (
  echo Warning: .env file not found. Creating default .env file...
  (
    echo # Database Configuration
    echo DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade
    echo.
    echo # Authentication
    echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    echo.
    echo # Server Configuration
    echo NODE_ENV=development
    echo PORT=3000
  ) > .env
  echo Created default .env file.
)

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: Node.js is not installed. Please install Node.js and try again.
  exit /b 1
)

:: Check for required npm packages
if not exist "node_modules" (
  echo Installing required packages...
  call npm install dotenv express cors pg bcryptjs jsonwebtoken nodemon
)

:: Start the auth server
echo.
echo Starting Auth Server on port 3000...
echo This server will handle authentication requests.

:: Run with nodemon for auto-restart on changes
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  call npx nodemon simple-server-esm.js
) else (
  node simple-server-esm.js
)