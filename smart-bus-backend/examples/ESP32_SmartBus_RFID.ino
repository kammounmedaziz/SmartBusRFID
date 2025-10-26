/*
 * SmartBus ESP32 RFID Payment System
 * 
 * Hardware Requirements:
 * - ESP32 Dev Board
 * - MFRC522 RFID Reader
 * - LCD Display (optional, for user feedback)
 * - Buzzer (optional, for audio feedback)
 * 
 * Pin Configuration:
 * MFRC522:
 *   SDA  -> GPIO 21
 *   SCK  -> GPIO 18
 *   MOSI -> GPIO 23
 *   MISO -> GPIO 19
 *   RST  -> GPIO 22
 * 
 * LCD (I2C):
 *   SDA -> GPIO 21
 *   SCL -> GPIO 22
 * 
 * Buzzer:
 *   PIN -> GPIO 25
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

// ========================
// Configuration
// ========================

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* SERVER_URL = "http://192.168.1.100:5000";  // Change to your server IP
const char* API_KEY = "smartbus-esp32-2025";           // Must match ESP32_API_KEY in .env

// Device Configuration
const char* DEVICE_ID = "BUS_001";
const char* LOCATION = "City Center Route";

// Default fare (will be fetched from server)
float defaultFare = 50.0;

// RFID Pins
#define RST_PIN     22
#define SS_PIN      21

// Buzzer Pin (optional)
#define BUZZER_PIN  25

// Create MFRC522 instance
MFRC522 rfid(SS_PIN, RST_PIN);

// ========================
// Helper Functions
// ========================

void playSuccessBeep() {
  #ifdef BUZZER_PIN
  tone(BUZZER_PIN, 2000, 100);
  delay(150);
  tone(BUZZER_PIN, 2500, 100);
  #endif
}

void playErrorBeep() {
  #ifdef BUZZER_PIN
  tone(BUZZER_PIN, 500, 200);
  delay(250);
  tone(BUZZER_PIN, 500, 200);
  #endif
}

void playBeep(int freq, int duration) {
  #ifdef BUZZER_PIN
  tone(BUZZER_PIN, freq, duration);
  #endif
}

// Convert RFID UID to string
String getCardUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";
    }
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

// ========================
// API Functions
// ========================

// Health check
bool checkServerHealth() {
  Serial.println("🔍 Checking server health...");
  
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/rfid/health";
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("✅ Server is healthy");
    Serial.println(response);
    http.end();
    return true;
  } else {
    Serial.printf("❌ Server health check failed: %d\n", httpCode);
    http.end();
    return false;
  }
}

// Get server configuration
bool getServerConfig() {
  Serial.println("⚙️  Fetching server configuration...");
  
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/rfid/config";
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    
    // Parse JSON
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      defaultFare = doc["config"]["default_fare"];
      int cooldown = doc["config"]["cooldown_seconds"];
      
      Serial.printf("✅ Config loaded: Fare=%.2f, Cooldown=%ds\n", defaultFare, cooldown);
      http.end();
      return true;
    }
  }
  
  Serial.println("❌ Failed to get configuration");
  http.end();
  return false;
}

// Check card info (pre-flight)
bool checkCard(String uid, float &balance, String &userName, String &status) {
  Serial.println("🔍 Checking card: " + uid);
  
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/rfid/check/" + uid;
  
  http.begin(url);
  http.addHeader("X-API-Key", API_KEY);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    
    // Parse JSON
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error && doc["success"] == true) {
      balance = doc["card"]["balance"];
      userName = doc["card"]["user_name"].as<String>();
      status = doc["card"]["status"].as<String>();
      
      Serial.printf("✅ Card found: %s, Balance: %.2f T-Pay\n", userName.c_str(), balance);
      http.end();
      return true;
    }
  } else if (httpCode == 404) {
    Serial.println("❌ Card not found in system");
  } else if (httpCode == 401) {
    Serial.println("❌ Invalid API key");
  }
  
  http.end();
  return false;
}

// Process payment
bool processPayment(String uid) {
  Serial.println("💳 Processing payment for: " + uid);
  
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/rfid/pay";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  http.addHeader("X-Device-ID", DEVICE_ID);
  http.addHeader("X-Device-MAC", WiFi.macAddress());
  
  // Build JSON payload
  DynamicJsonDocument doc(512);
  doc["uid"] = uid;
  doc["fare"] = defaultFare;
  doc["device_id"] = DEVICE_ID;
  doc["location"] = LOCATION;
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("📤 Sending: " + payload);
  
  int httpCode = http.POST(payload);
  String response = http.getString();
  
  Serial.printf("📥 Response [%d]: %s\n", httpCode, response.c_str());
  
  // Parse response
  DynamicJsonDocument resDoc(2048);
  DeserializationError error = deserializeJson(resDoc, response);
  
  if (error) {
    Serial.println("❌ JSON parse error");
    http.end();
    return false;
  }
  
  if (httpCode == 200 && resDoc["success"] == true) {
    // Success!
    String cardHolder = resDoc["transaction"]["card_holder"];
    float charged = resDoc["transaction"]["fare_charged"];
    float newBalance = resDoc["transaction"]["new_balance"];
    int txId = resDoc["transaction"]["id"];
    
    Serial.println("✅ PAYMENT SUCCESSFUL!");
    Serial.printf("   Passenger: %s\n", cardHolder.c_str());
    Serial.printf("   Charged: %.2f T-Pay\n", charged);
    Serial.printf("   New Balance: %.2f T-Pay\n", newBalance);
    Serial.printf("   Transaction ID: %d\n", txId);
    
    playSuccessBeep();
    http.end();
    return true;
    
  } else {
    // Failed
    String errorCode = resDoc["error_code"];
    String message = resDoc["message"];
    
    Serial.println("❌ PAYMENT FAILED!");
    Serial.printf("   Error: %s\n", errorCode.c_str());
    Serial.printf("   Message: %s\n", message.c_str());
    
    // Handle specific errors
    if (errorCode == "INSUFFICIENT_BALANCE") {
      float shortage = resDoc["details"]["shortage"];
      Serial.printf("   Shortage: %.2f T-Pay\n", shortage);
    } else if (errorCode == "RATE_LIMITED") {
      int waitSeconds = resDoc["wait_seconds"];
      Serial.printf("   Wait: %d seconds\n", waitSeconds);
    } else if (errorCode == "CARD_BLOCKED") {
      Serial.println("   Status: Card is blocked");
    }
    
    playErrorBeep();
    http.end();
    return false;
  }
}

// ========================
// Setup
// ========================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════╗");
  Serial.println("║   SmartBus RFID Payment System    ║");
  Serial.println("║         ESP32 Controller           ║");
  Serial.println("╚════════════════════════════════════╝");
  Serial.println();
  
  // Initialize buzzer
  #ifdef BUZZER_PIN
  pinMode(BUZZER_PIN, OUTPUT);
  playBeep(1000, 100);
  #endif
  
  // Initialize SPI and RFID
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("✅ RFID reader initialized");
  
  // Connect to WiFi
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("   IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("   MAC: ");
    Serial.println(WiFi.macAddress());
    
    playBeep(2000, 100);
    
    // Check server health
    if (checkServerHealth()) {
      getServerConfig();
      playBeep(2500, 100);
    } else {
      Serial.println("⚠️  Warning: Server not reachable");
      playErrorBeep();
    }
    
  } else {
    Serial.println("\n❌ WiFi connection failed!");
    Serial.println("   System will continue but payments won't work");
  }
  
  Serial.println("\n🔄 Ready! Waiting for cards...\n");
}

// ========================
// Main Loop
// ========================

void loop() {
  // Check for new card
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Get card UID
  String uid = getCardUID();
  
  Serial.println("\n" + String("=").substring(0, 50));
  Serial.println("🎴 Card detected: " + uid);
  Serial.println(String("=").substring(0, 50));
  
  playBeep(1500, 50);
  
  // Check WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ No WiFi connection!");
    playErrorBeep();
    delay(2000);
    return;
  }
  
  // Optional: Check card info first (pre-flight)
  float balance;
  String userName;
  String status;
  
  if (checkCard(uid, balance, userName, status)) {
    Serial.printf("👤 Passenger: %s\n", userName.c_str());
    Serial.printf("💰 Balance: %.2f T-Pay\n", balance);
    Serial.printf("📋 Status: %s\n", status.c_str());
    
    if (status != "active") {
      Serial.println("❌ Card is not active!");
      playErrorBeep();
      delay(2000);
      return;
    }
    
    if (balance < defaultFare) {
      Serial.printf("❌ Insufficient balance! Need %.2f T-Pay\n", defaultFare);
      playErrorBeep();
      delay(2000);
      return;
    }
    
    // Show info, wait a moment
    delay(500);
  }
  
  // Process payment
  bool success = processPayment(uid);
  
  if (success) {
    Serial.println("✅ Welcome aboard! Have a nice trip!");
  } else {
    Serial.println("❌ Payment declined. Please try again or recharge.");
  }
  
  // Halt PICC
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  // Wait before next scan
  delay(2000);
  
  Serial.println("\n🔄 Ready for next card...\n");
}
