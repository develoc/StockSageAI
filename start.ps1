# Quantum Trade Startup Script (PowerShell)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "         Quantum Trade Startup Script          " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Using Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in the PATH." -ForegroundColor Red
    Write-Host "Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Quantum Trade..." -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Starting backend server on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; npm run dev:server"
Write-Host ""

Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

Write-Host "2. Starting frontend client on port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; npm run dev:client"
Write-Host ""

Write-Host "=============================================" -ForegroundColor Green
Write-Host "Quantum Trade is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "* Backend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "* Frontend: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Use Ctrl+C in the respective PowerShell windows to stop the servers." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Green

# Run a connection check after a brief pause
Write-Host "Performing connection verification in 10 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
node verify-connection.js

Write-Host ""
Write-Host "Navigate to http://localhost:5000 in your browser to use Quantum Trade." -ForegroundColor Green
Write-Host ""
