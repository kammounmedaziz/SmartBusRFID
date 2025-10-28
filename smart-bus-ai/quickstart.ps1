# Quick Start AI Server - Minimal Setup
Write-Host "Smart Bus AI Server - Quick Start" -ForegroundColor Cyan
Write-Host ""

# Check Python
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "ERROR: Python not installed" -ForegroundColor Red
    exit 1
}

$pythonVersion = python --version 2>&1
Write-Host "Python: $pythonVersion" -ForegroundColor Green

# Navigate to AI directory
$aiDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $aiDir

# Quick install of core packages only
Write-Host ""
Write-Host "Installing core dependencies (this may take a few minutes)..." -ForegroundColor Yellow
Write-Host "Note: DeepFace will download models on first use (~100MB)" -ForegroundColor Cyan
Write-Host ""

# Install without virtual env for speed
pip install fastapi uvicorn deepface opencv-python pillow numpy --quiet

Write-Host ""
Write-Host "Testing installation..." -ForegroundColor Cyan

# Test imports
$testScript = @"
try:
    import fastapi
    import uvicorn
    import cv2
    print('OK: Core packages installed')
except Exception as e:
    print(f'ERROR: {e}')
"@

python -c $testScript

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Ready to start AI server!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Start server with: python app.py" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: DeepFace will auto-download models on first face registration/verification" -ForegroundColor Cyan
