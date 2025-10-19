# WSL Backend and Frontend Starter
# This script starts both backend and frontend in WSL environments

# Colors for output
$CYAN = [char]27 + "[36m"
$GREEN = [char]27 + "[32m"
$YELLOW = [char]27 + "[33m"
$RED = [char]27 + "[31m"
$RESET = [char]27 + "[0m"

Write-Host "$CYAN=============================================$RESET"
Write-Host "$CYAN      Quantum Trade WSL Connection Helper     $RESET"
Write-Host "$CYAN=============================================$RESET"
Write-Host ""

# Check if WSL is installed
$wslCheck = wsl --list --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "${RED}WSL does not appear to be installed or configured properly.$RESET" 
    Write-Host "Please ensure WSL is installed and set up correctly."
    exit 1
}

# Get the default WSL distribution
$defaultWsl = wsl -l --running | Select-String -Pattern "\* " | ForEach-Object { $_.ToString().Replace("* ", "") }
if ([string]::IsNullOrEmpty($defaultWsl)) {
    Write-Host "${YELLOW}No running WSL distribution found. Using default.$RESET"
    $defaultWsl = wsl -l | Select-String -Pattern "\* " | ForEach-Object { $_.ToString().Replace("* ", "") }
}

Write-Host "${GREEN}Using WSL distribution: $defaultWsl$RESET"
Write-Host ""

# Get the project path
$projectPath = $PSScriptRoot
Write-Host "${YELLOW}Project path: $projectPath$RESET"

# Convert Windows path to WSL path
$wslProjectPath = wsl wslpath "$projectPath"
Write-Host "${YELLOW}WSL project path: $wslProjectPath$RESET"
Write-Host ""

# Check WSL IP address
Write-Host "${CYAN}Detecting WSL IP address...$RESET"
$wslIp = wsl hostname -I
Write-Host "${GREEN}WSL IP Address: $wslIp$RESET"
Write-Host ""

# Ensure both client and server can be reached
Write-Host "${CYAN}Ensuring both client and server can be reached...$RESET"

# First check if the required ports are already in use
$port3000InUse = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
$port5000InUse = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue

if ($port3000InUse) {
    Write-Host "${YELLOW}Port 3000 is already in use. Make sure it's your backend server.$RESET"
} else {
    Write-Host "${GREEN}Port 3000 is available for the backend server.$RESET"
}

if ($port5000InUse) {
    Write-Host "${YELLOW}Port 5000 is already in use. Make sure it's your frontend server.$RESET"
} else {
    Write-Host "${GREEN}Port 5000 is available for the frontend server.$RESET"
}

Write-Host ""
Write-Host "${CYAN}Starting backend server in WSL...$RESET"

# Start backend in WSL
$backendCmd = "cd $wslProjectPath && npm run dev:server"
Start-Process wsl -ArgumentList "-d $defaultWsl", "-e bash", "-c", "$backendCmd"

Write-Host "${YELLOW}Waiting for backend to initialize...$RESET"
Start-Sleep -Seconds 5

# Check if backend is responding
$backendTest = wsl curl -s --max-time 2 http://localhost:3000/api/health
if ($LASTEXITCODE -eq 0) {
    Write-Host "${GREEN}Backend server is running!$RESET"
} else {
    Write-Host "${RED}Backend server did not respond. It might still be starting up or there may be an issue.$RESET"
}

Write-Host ""
Write-Host "${CYAN}Starting frontend client in WSL...$RESET"

# Start frontend in WSL
$frontendCmd = "cd $wslProjectPath/client && npm run dev"
Start-Process wsl -ArgumentList "-d $defaultWsl", "-e bash", "-c", "$frontendCmd"

Write-Host "${YELLOW}Waiting for frontend to initialize...$RESET"
Start-Sleep -Seconds 5

# Check if frontend is responding
$frontendTest = wsl curl -s --max-time 2 http://localhost:5000
if ($LASTEXITCODE -eq 0) {
    Write-Host "${GREEN}Frontend client is running!$RESET"
} else {
    Write-Host "${RED}Frontend client did not respond. It might still be starting up or there may be an issue.$RESET"
}

Write-Host ""
Write-Host "${CYAN}=============================================$RESET"
Write-Host "${GREEN}Quantum Trade is starting!$RESET"
Write-Host ""
Write-Host "${YELLOW}* Backend: http://localhost:3000$RESET"
Write-Host "${YELLOW}* Frontend: http://localhost:5000$RESET"
Write-Host "${YELLOW}* WSL Frontend: http://$wslIp`:5000$RESET"
Write-Host ""
Write-Host "${YELLOW}Use Ctrl+C in the WSL terminal windows to stop the servers.$RESET"
Write-Host "${CYAN}=============================================$RESET"

# Open browser to frontend
Write-Host ""
Write-Host "${CYAN}Opening Quantum Trade in your default browser...$RESET"
Start-Process "http://localhost:5000"
