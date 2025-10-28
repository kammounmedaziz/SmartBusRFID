# Start SmartBus App (Frontend + Backend + AI Server)

Write-Host "Starting SmartBus App..." -ForegroundColor Green
Write-Host ""

# Check if AI Server dependencies are ready
Write-Host "Checking AI Server..." -ForegroundColor Yellow
$aiPath = Join-Path $PSScriptRoot 'smart-bus-ai'
if (Test-Path $aiPath) {
    $appPyPath = Join-Path $aiPath 'app.py'
    if (Test-Path $appPyPath) {
        Write-Host "   ✓ AI Server found" -ForegroundColor Green
        # Start AI Server in separate window
        Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',"Set-Location -Path '$aiPath'; Write-Host 'Starting AI Server (Python FastAPI)...' -ForegroundColor Cyan; python app.py" -WorkingDirectory $aiPath | Out-Null
        Write-Host "   ✓ AI Server started" -ForegroundColor Green
    } else {
        Write-Host "   ✗ app.py not found in AI server directory" -ForegroundColor Red
    }
} else {
    Write-Host "   ! AI Server path not found: $aiPath" -ForegroundColor Yellow
    Write-Host "   Face authentication will not be available" -ForegroundColor Yellow
}

Write-Host ""

# Start backend (opens new console windows so you can see logs)
Write-Host "Starting backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot 'smart-bus-backend'
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',"Set-Location -Path '$backendPath'; npm run dev" -WorkingDirectory $backendPath | Out-Null

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot 'smart-bus-frontend'
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',"Set-Location -Path '$frontendPath'; npm run dev" -WorkingDirectory $frontendPath | Out-Null

Write-Host ""
Write-Host "All services started in separate PowerShell windows!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "AI Server:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Backend:    http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the spawned windows to stop the servers." -ForegroundColor Magenta
Write-Host "Face authentication is now available!" -ForegroundColor Green