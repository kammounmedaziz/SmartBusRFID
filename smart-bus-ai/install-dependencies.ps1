# Install Smart Bus AI Server Dependencies
Write-Host "Installing Smart Bus AI Server dependencies..." -ForegroundColor Cyan

# Check if Python is installed
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "ERROR: Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check Python version
$pythonVersion = python --version 2>&1
Write-Host "Found: $pythonVersion" -ForegroundColor Green

# Navigate to AI directory
$aiDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $aiDir

# Create virtual environment if it does not exist
if (-not (Test-Path "venv")) {
    Write-Host ""
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Virtual environment created!" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt

# Verify critical packages
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Cyan
$packages = @("fastapi", "uvicorn", "deepface", "opencv-python", "tensorflow")

foreach ($package in $packages) {
    $installed = pip show $package 2>&1
    if ($installed -match "Name:") {
        Write-Host "OK $package installed" -ForegroundColor Green
    } else {
        Write-Host "ERROR $package NOT installed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the AI server:" -ForegroundColor Yellow
Write-Host "  1. Activate venv with .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  2. Run server with python app.py" -ForegroundColor White
Write-Host ""
Write-Host "Or use start.ps1 from project root" -ForegroundColor Yellow
