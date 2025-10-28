# Check status of all SmartBus services

Write-Host "Checking SmartBus Services Status..." -ForegroundColor Cyan
Write-Host ""

# Check AI Server (Python)
Write-Host "1. AI Server (Python - Port 8000):" -ForegroundColor Yellow
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    Write-Host "   ✓ Running" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✓ Health check passed" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ! Process running but health check failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ Not running" -ForegroundColor Red
}

# Check Backend (Node.js)
Write-Host ""
Write-Host "2. Backend (Node.js - Port 5000):" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ✓ Running ($($nodeProcesses.Count) process(es))" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✓ Health check passed" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ! Backend endpoint check (might be normal if no /api/health route)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ Not running" -ForegroundColor Red
}

# Check Frontend (Vite dev server - runs under Node)
Write-Host ""
Write-Host "3. Frontend (Vite - Port 5173):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Running and accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Not accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

# Summary
$allRunning = ($pythonProcesses -ne $null) -and ($nodeProcesses -ne $null)
if ($allRunning) {
    Write-Host "Status: All services running ✓" -ForegroundColor Green
} else {
    Write-Host "Status: Some services not running ✗" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start all services, run: .\start.ps1" -ForegroundColor Yellow
}

Write-Host "============================================" -ForegroundColor Cyan
