# Start SmartBus App (Frontend + Backend)

Write-Host "Starting SmartBus App..." -ForegroundColor Green


# Start backend (opens new console windows so you can see logs)
Write-Host "Starting backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot 'smart-bus-backend'
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',"Set-Location -Path '$backendPath'; npm run dev" -WorkingDirectory $backendPath | Out-Null

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot 'smart-bus-frontend'
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',"Set-Location -Path '$frontendPath'; npm run dev" -WorkingDirectory $frontendPath | Out-Null

Write-Host "Spawned backend and frontend processes in separate PowerShell windows." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000 (if using default)" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173 (Vite default)" -ForegroundColor Cyan
Write-Host "Close the spawned windows to stop the servers." -ForegroundColor Magenta