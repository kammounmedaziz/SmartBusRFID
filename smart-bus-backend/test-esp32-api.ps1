# SmartBus ESP32 RFID API Test Script (PowerShell)
# Tests all ESP32 endpoints

Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SmartBus ESP32 RFID API Test Suite         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SERVER = "http://localhost:5000"
$API_KEY = "smartbus-esp32-2025"
$TEST_CARD_UID = "ABC123"  # Change this to a real card UID from your database

# Test counters
$PASSED = 0
$FAILED = 0

# Helper function to run test
function Run-Test {
    param(
        [string]$TestName,
        [int]$ExpectedCode,
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $httpCode = $response.StatusCode
        $content = $response.Content
        
        if ($httpCode -eq $ExpectedCode) {
            Write-Host "✅ PASS - HTTP $httpCode" -ForegroundColor Green
            try {
                $json = $content | ConvertFrom-Json
                $json | ConvertTo-Json -Depth 10
            } catch {
                Write-Host $content
            }
            $script:PASSED++
        } else {
            Write-Host "❌ FAIL - Expected $ExpectedCode, got $httpCode" -ForegroundColor Red
            Write-Host $content
            $script:FAILED++
        }
    } catch {
        $httpCode = $_.Exception.Response.StatusCode.value__
        $content = $_.ErrorDetails.Message
        
        if ($httpCode -eq $ExpectedCode) {
            Write-Host "✅ PASS - HTTP $httpCode" -ForegroundColor Green
            try {
                $json = $content | ConvertFrom-Json
                $json | ConvertTo-Json -Depth 10
            } catch {
                Write-Host $content
            }
            $script:PASSED++
        } else {
            Write-Host "❌ FAIL - Expected $ExpectedCode, got $httpCode" -ForegroundColor Red
            Write-Host $content
            $script:FAILED++
        }
    }
    
    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host ""
}

# Start tests
Write-Host "Starting tests..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Run-Test -TestName "Health Check" -ExpectedCode 200 `
    -Url "$SERVER/api/rfid/health"

# Test 2: Get Configuration
Run-Test -TestName "Get Configuration" -ExpectedCode 200 `
    -Url "$SERVER/api/rfid/config"

# Test 3: Check Card (Missing API Key)
Run-Test -TestName "Check Card - No API Key (Should Fail)" -ExpectedCode 401 `
    -Url "$SERVER/api/rfid/check/$TEST_CARD_UID"

# Test 4: Check Card (Invalid API Key)
Run-Test -TestName "Check Card - Invalid API Key (Should Fail)" -ExpectedCode 401 `
    -Url "$SERVER/api/rfid/check/$TEST_CARD_UID" `
    -Headers @{"X-API-Key" = "wrong-key"}

# Test 5: Check Card (Valid API Key)
Run-Test -TestName "Check Card - Valid API Key" -ExpectedCode 200 `
    -Url "$SERVER/api/rfid/check/$TEST_CARD_UID" `
    -Headers @{"X-API-Key" = $API_KEY}

# Test 6: Check Card (Not Found)
Run-Test -TestName "Check Card - Not Found" -ExpectedCode 404 `
    -Url "$SERVER/api/rfid/check/INVALID_UID" `
    -Headers @{"X-API-Key" = $API_KEY}

# Test 7: Process Payment (Missing API Key)
Run-Test -TestName "Payment - No API Key (Should Fail)" -ExpectedCode 401 `
    -Method "POST" `
    -Url "$SERVER/api/rfid/pay" `
    -Body (@{uid=$TEST_CARD_UID; fare=50} | ConvertTo-Json)

# Test 8: Process Payment (Valid)
Run-Test -TestName "Payment - Success" -ExpectedCode 200 `
    -Method "POST" `
    -Url "$SERVER/api/rfid/pay" `
    -Headers @{
        "X-API-Key" = $API_KEY
        "X-Device-ID" = "TEST_DEVICE"
        "X-Device-MAC" = "00:11:22:33:44:55"
    } `
    -Body (@{
        uid = $TEST_CARD_UID
        fare = 50
        device_id = "TEST_001"
        location = "Test Location"
    } | ConvertTo-Json)

# Test 9: Rate Limiting
Write-Host "Info: Waiting 2 seconds before rate limit test..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Run-Test -TestName "Payment - Rate Limited (Should Fail)" -ExpectedCode 429 `
    -Method "POST" `
    -Url "$SERVER/api/rfid/pay" `
    -Headers @{"X-API-Key" = $API_KEY} `
    -Body (@{uid=$TEST_CARD_UID; fare=50} | ConvertTo-Json)

# Test 10: Payment with Card Not Found
Run-Test -TestName "Payment - Card Not Found" -ExpectedCode 404 `
    -Method "POST" `
    -Url "$SERVER/api/rfid/pay" `
    -Headers @{"X-API-Key" = $API_KEY} `
    -Body (@{uid="INVALID_CARD"; fare=50} | ConvertTo-Json)

# Test 11: Get Card Transactions
Run-Test -TestName "Get Card Transactions" -ExpectedCode 200 `
    -Url "$SERVER/api/rfid/transactions/${TEST_CARD_UID}?limit=5" `
    -Headers @{"X-API-Key" = $API_KEY}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              Test Summary                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Passed: $PASSED" -ForegroundColor Green
Write-Host "Failed: $FAILED" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some tests failed. Please check the output above." -ForegroundColor Red
    exit 1
}
