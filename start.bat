@echo off
echo =============================================
echo         Quantum Trade Startup Script
echo =============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in the PATH.
    echo Please install Node.js and try again.
    exit /b 1
)

echo Starting Quantum Trade...
echo.

echo 1. Starting backend server on port 3000...
start cmd /k "title Quantum Trade Backend && cd %~dp0 && npm run dev:server"
echo.

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul
echo.

echo 2. Starting frontend client on port 5000...
start cmd /k "title Quantum Trade Frontend && cd %~dp0 && npm run dev:client"
echo.

echo =============================================
echo Quantum Trade is starting!
echo.
echo * Backend: http://localhost:3000
echo * Frontend: http://localhost:5000
echo.
echo Use Ctrl+C in the respective terminal windows to stop the servers.
echo =============================================

REM Run a connection check after a brief pause
timeout /t 10 /nobreak >nul
node verify-connection.js

echo.
echo Navigate to http://localhost:5000 in your browser to use Quantum Trade.
echo.
