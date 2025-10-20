# Start SmartBus App (Frontend + Backend)

Write-Host "Starting SmartBus App..." -ForegroundColor Green

# Start backend
Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Job -ScriptBlock { Set-Location "C:\Users\pc\Desktop\RFID PROJECT\smart-bus-backend"; & "C:\Program Files\nodejs\npm.ps1" start } | Out-Null

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Job -ScriptBlock { Set-Location "C:\Users\pc\Desktop\RFID PROJECT\smart-bus-frontend"; & "C:\Program Files\nodejs\npm.ps1" run dev } | Out-Null

Write-Host "Both services started successfully!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C in the terminals to stop." -ForegroundColor Magenta