# Smart Bus AI Server - Startup Script (Windows PowerShell)

Write-Host "=== Smart Bus AI Server ===" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-Not (Test-Path "venv\Scripts\activate.ps1")) {
    Write-Host "Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv venv
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    .\venv\Scripts\pip install -r requirements.txt
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& .\venv\Scripts\Activate.ps1

# Check if Vosk model exists
if (-Not (Test-Path "models\vosk\vosk-model-small-en-us-0.15")) {
    Write-Host ""
    Write-Host "WARNING: Vosk model not found!" -ForegroundColor Red
    Write-Host "Download from: https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip" -ForegroundColor Yellow
    Write-Host "Extract to: models\vosk\vosk-model-small-en-us-0.15\" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue without speech recognition..."
    Read-Host
}

# Start server
Write-Host ""
Write-Host "Starting AI Server on http://localhost:8000" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python app.py
