# Stop all SmartBus services

Write-Host "Stopping SmartBus services..." -ForegroundColor Yellow
Write-Host ""

# Stop Node.js processes (Backend)
Write-Host "Stopping Node.js (Backend)..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "   ✓ Backend stopped" -ForegroundColor Green
} else {
    Write-Host "   - No Node.js processes found" -ForegroundColor Gray
}

# Stop Python processes (AI Server)
Write-Host "Stopping Python (AI Server)..." -ForegroundColor Cyan
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    $pythonProcesses | Stop-Process -Force
    Write-Host "   ✓ AI Server stopped" -ForegroundColor Green
} else {
    Write-Host "   - No Python processes found" -ForegroundColor Gray
}

# Note: Vite dev server runs under node, already stopped above

Write-Host ""
Write-Host "All services stopped!" -ForegroundColor Green
