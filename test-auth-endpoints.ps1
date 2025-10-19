# Authentication Server API Test Script (PowerShell)

# Base URL
$serverUrl = "http://localhost:3000"

Write-Host "==============================================="
Write-Host "    Authentication Server API Test Script      "
Write-Host "==============================================="
Write-Host ""

# Test health endpoint
Write-Host "Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$serverUrl/api/health" -Method Get -ErrorAction Stop
    Write-Host "✓ Health endpoint: Status 200 OK" -ForegroundColor Green
    Write-Host "Response:"
    $healthResponse | ConvertTo-Json
} catch {
    Write-Host "✗ Health endpoint failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}
Write-Host ""

# Test login endpoint
Write-Host "Testing login endpoint..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@quantumtrade.ai"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$serverUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ Login endpoint: Status 200 OK" -ForegroundColor Green
    Write-Host "Response:"
    $loginResponse | ConvertTo-Json
    
    # Extract token for further tests
    $token = $loginResponse.token
    
    # Test user endpoint with the token
    Write-Host "`nTesting user endpoint with token..." -ForegroundColor Yellow
    try {
        $userResponse = Invoke-RestMethod -Uri "$serverUrl/api/auth/user" -Method Get -Headers @{Authorization = "Bearer $token"} -ErrorAction Stop
        Write-Host "✓ User endpoint: Status 200 OK" -ForegroundColor Green
        Write-Host "Response:"
        $userResponse | ConvertTo-Json
    } catch {
        Write-Host "✗ User endpoint failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
    
    # Test logout endpoint
    Write-Host "`nTesting logout endpoint..." -ForegroundColor Yellow
    try {
        $logoutResponse = Invoke-RestMethod -Uri "$serverUrl/api/auth/logout" -Method Post -Headers @{Authorization = "Bearer $token"} -ErrorAction Stop
        Write-Host "✓ Logout endpoint: Status 200 OK" -ForegroundColor Green
        Write-Host "Response:"
        $logoutResponse | ConvertTo-Json
    } catch {
        Write-Host "✗ Logout endpoint failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
} catch {
    Write-Host "✗ Login endpoint failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`n==============================================="
Write-Host "             Test Script Completed              "
Write-Host "==============================================="