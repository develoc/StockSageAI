# Auth Server Startup PowerShell Script

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "      Auth Server Startup Script     " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if the .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Creating default .env file..." -ForegroundColor Yellow
    @"
# Database Configuration
DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
NODE_ENV=development
PORT=3000
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "Created default .env file." -ForegroundColor Green
}

# Check for Node.js packages
Write-Host "`nChecking required packages..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# Check for required npm packages
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing required packages..." -ForegroundColor Yellow
    npm install dotenv express cors pg bcryptjs jsonwebtoken nodemon
}

# Start the auth server
Write-Host "`nStarting Auth Server on port 3000..." -ForegroundColor Green
Write-Host "This server will handle authentication requests." -ForegroundColor Yellow

# Run with nodemon for auto-restart on changes
if (Get-Command npx -ErrorAction SilentlyContinue) {
    npx nodemon simple-server-esm.js
} else {
    node simple-server-esm.js
}