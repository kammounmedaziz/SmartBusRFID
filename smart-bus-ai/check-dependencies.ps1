# Check Python dependencies for AI Server

Write-Host "Checking AI Server Dependencies..." -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "1. Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
Write-Host ""
Write-Host "2. Checking virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "   ✓ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "   ! Virtual environment not found" -ForegroundColor Yellow
    Write-Host "   Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
    Write-Host "   ✓ Virtual environment created" -ForegroundColor Green
}

# Check requirements.txt
Write-Host ""
Write-Host "3. Checking requirements.txt..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    Write-Host "   ✓ requirements.txt found" -ForegroundColor Green
} else {
    Write-Host "   ✗ requirements.txt not found!" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
Write-Host ""
Write-Host "4. Checking installed packages..." -ForegroundColor Yellow
Write-Host "   Activating virtual environment..." -ForegroundColor Cyan

if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
    
    # Check key dependencies
    $packages = @("fastapi", "uvicorn", "deepface", "opencv-python")
    $allInstalled = $true
    
    foreach ($package in $packages) {
        $installed = pip show $package 2>$null
        if ($installed) {
            Write-Host "   ✓ $package installed" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $package NOT installed" -ForegroundColor Red
            $allInstalled = $false
        }
    }
    
    if (-not $allInstalled) {
        Write-Host ""
        Write-Host "Installing missing dependencies..." -ForegroundColor Yellow
        pip install -r requirements.txt
        Write-Host "   ✓ Dependencies installed" -ForegroundColor Green
    }
} else {
    Write-Host "   ✗ Cannot activate virtual environment" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "AI Server is ready to start!" -ForegroundColor Green
Write-Host "Run: python app.py" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
