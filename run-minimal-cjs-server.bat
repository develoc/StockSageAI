@echo off
echo =====================================
echo     Minimal Test Server (CommonJS)
echo =====================================

rem Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Node.js is not installed. Please install Node.js and try again.
  exit /b 1
)

rem Ensure dependencies are installed
if not exist "node_modules\express" (
  echo Installing required dependencies...
  call npm install express cors dotenv
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies.
    exit /b 1
  )
  echo Dependencies installed successfully.
) else (
  echo Dependencies already installed.
)

rem Set PORT environment variable if not already set
if "%PORT%"=="" (
  set PORT=3000
)

echo Starting minimal test server (CommonJS) on port %PORT%...
echo Press Ctrl+C to stop the server.
echo =====================================

rem Run the minimal server (CommonJS version)
node minimal-auth-server.cjs