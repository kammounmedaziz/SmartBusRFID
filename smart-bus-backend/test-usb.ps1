# SmartBus ESP32 USB Serial - Quick Start Test
# This script helps you test the USB connection

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ESP32 USB Serial - Quick Test              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if serialport is installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

if (-not $packageJson.dependencies.serialport) {
    Write-Host "❌ SerialPort not found in package.json" -ForegroundColor Red
    Write-Host "Installing serialport..." -ForegroundColor Yellow
    npm install serialport
} else {
    Write-Host "✅ SerialPort is installed" -ForegroundColor Green
}

Write-Host "`n1️⃣  Step 1: List Available COM Ports`n" -ForegroundColor Yellow

# List COM ports using PowerShell
Write-Host "Available COM Ports:" -ForegroundColor Cyan
Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description, Name | Format-Table -AutoSize

Write-Host "`n💡 Common ESP32 ports:" -ForegroundColor Yellow
Write-Host "   - COM3, COM4, COM5 (Windows)" -ForegroundColor Gray
Write-Host "   - Usually shown as 'USB Serial Port' or 'CH340' in device manager`n" -ForegroundColor Gray

# Get user input
Write-Host "2️⃣  Step 2: Connect to ESP32`n" -ForegroundColor Yellow
$comPort = Read-Host "Enter your ESP32 COM port (e.g., COM3)"

if (-not $comPort) {
    Write-Host "`n❌ No port specified. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "`n3️⃣  Step 3: Starting USB Serial Service...`n" -ForegroundColor Yellow
Write-Host "Running: node start-esp32-usb.js $comPort`n" -ForegroundColor Gray

# Start the service
node start-esp32-usb.js $comPort
