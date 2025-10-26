#!/bin/bash

# SmartBus ESP32 RFID API Test Script
# Tests all ESP32 endpoints

echo "╔════════════════════════════════════════════════╗"
echo "║   SmartBus ESP32 RFID API Test Suite         ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Configuration
SERVER="http://localhost:5000"
API_KEY="smartbus-esp32-2025"
TEST_CARD_UID="ABC123"  # Change this to a real card UID from your database

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to run test
run_test() {
    local test_name=$1
    local expected_code=$2
    local command=$3
    
    echo -e "${YELLOW}Testing:${NC} $test_name"
    
    response=$(eval $command)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} - HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - Expected $expected_code, got $http_code"
        echo "$body"
        ((FAILED++))
    fi
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Start tests
echo "Starting tests..."
echo ""

# Test 1: Health Check
run_test "Health Check" 200 \
    "curl -s -w '\n%{http_code}' $SERVER/api/rfid/health"

# Test 2: Get Configuration
run_test "Get Configuration" 200 \
    "curl -s -w '\n%{http_code}' $SERVER/api/rfid/config"

# Test 3: Check Card (Missing API Key)
run_test "Check Card - No API Key (Should Fail)" 401 \
    "curl -s -w '\n%{http_code}' $SERVER/api/rfid/check/$TEST_CARD_UID"

# Test 4: Check Card (Invalid API Key)
run_test "Check Card - Invalid API Key (Should Fail)" 401 \
    "curl -s -w '\n%{http_code}' -H 'X-API-Key: wrong-key' $SERVER/api/rfid/check/$TEST_CARD_UID"

# Test 5: Check Card (Valid API Key)
run_test "Check Card - Valid API Key" 200 \
    "curl -s -w '\n%{http_code}' -H 'X-API-Key: $API_KEY' $SERVER/api/rfid/check/$TEST_CARD_UID"

# Test 6: Check Card (Not Found)
run_test "Check Card - Not Found" 404 \
    "curl -s -w '\n%{http_code}' -H 'X-API-Key: $API_KEY' $SERVER/api/rfid/check/INVALID_UID"

# Test 7: Process Payment (Missing API Key)
run_test "Payment - No API Key (Should Fail)" 401 \
    "curl -s -w '\n%{http_code}' -X POST -H 'Content-Type: application/json' \
     -d '{\"uid\":\"$TEST_CARD_UID\",\"fare\":50}' \
     $SERVER/api/rfid/pay"

# Test 8: Process Payment (Valid)
run_test "Payment - Success" 200 \
    "curl -s -w '\n%{http_code}' -X POST \
     -H 'Content-Type: application/json' \
     -H 'X-API-Key: $API_KEY' \
     -H 'X-Device-ID: TEST_DEVICE' \
     -H 'X-Device-MAC: 00:11:22:33:44:55' \
     -d '{\"uid\":\"$TEST_CARD_UID\",\"fare\":50,\"device_id\":\"TEST_001\",\"location\":\"Test Location\"}' \
     $SERVER/api/rfid/pay"

# Test 9: Rate Limiting (should fail if called immediately after Test 8)
echo -e "${YELLOW}Info:${NC} Waiting 2 seconds before rate limit test..."
sleep 2

run_test "Payment - Rate Limited (Should Fail)" 429 \
    "curl -s -w '\n%{http_code}' -X POST \
     -H 'Content-Type: application/json' \
     -H 'X-API-Key: $API_KEY' \
     -d '{\"uid\":\"$TEST_CARD_UID\",\"fare\":50}' \
     $SERVER/api/rfid/pay"

# Test 10: Payment with Card Not Found
run_test "Payment - Card Not Found" 404 \
    "curl -s -w '\n%{http_code}' -X POST \
     -H 'Content-Type: application/json' \
     -H 'X-API-Key: $API_KEY' \
     -d '{\"uid\":\"INVALID_CARD\",\"fare\":50}' \
     $SERVER/api/rfid/pay"

# Test 11: Get Card Transactions
run_test "Get Card Transactions" 200 \
    "curl -s -w '\n%{http_code}' -H 'X-API-Key: $API_KEY' \
     $SERVER/api/rfid/transactions/$TEST_CARD_UID?limit=5"

# Summary
echo "╔════════════════════════════════════════════════╗"
echo "║              Test Summary                      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi
