# Set permissions for WSL scripts
Write-Host "Setting execution permissions for shell scripts in WSL..." -ForegroundColor Blue

try {
    # List of scripts to make executable
    $scripts = @(
        "run-minimal-esm-server.sh",
        "run-minimal-cjs-server.sh",
        "test-auth-endpoints.sh",
        "start-auth-server.sh"
    )
    
    # Loop through each script and set permissions
    foreach ($script in $scripts) {
        if (Test-Path $script) {
            Write-Host "Setting permissions for $script..." -ForegroundColor Yellow
            wsl chmod +x $script
            Write-Host "✓ Permissions set for $script" -ForegroundColor Green
        } else {
            Write-Host "× Script not found: $script" -ForegroundColor Red
        }
    }
    
    Write-Host "`nAll permissions set successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error setting permissions: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nNow you can run the scripts in WSL:" -ForegroundColor Cyan
Write-Host "  ./run-minimal-esm-server.sh" -ForegroundColor Cyan
Write-Host "  ./run-minimal-cjs-server.sh" -ForegroundColor Cyan
Write-Host "  ./test-auth-endpoints.sh" -ForegroundColor Cyan