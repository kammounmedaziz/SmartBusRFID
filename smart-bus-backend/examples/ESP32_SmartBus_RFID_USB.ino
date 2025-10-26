/*
 * SmartBus ESP32 RFID Payment System - USB/Serial Version
 * 
 * This version uses USB Serial communication instead of WiFi.
 * The ESP32 connects to your computer via USB cable and communicates
 * with the Node.js backend through the serial port.
 * 
 * Hardware Requirements:
 * - ESP32 Dev Board
 * - MFRC522 RFID Reader
 * - USB Cable (for communication and power)
 * - Buzzer (optional, for audio feedback)
 * - LED (optional, for visual feedback)
 * 
 * Pin Configuration:
 * MFRC522:
 *   SDA  -> GPIO 5
 *   SCK  -> GPIO 18
 *   MOSI -> GPIO 23
 *   MISO -> GPIO 19
 *   RST  -> GPIO 22
 * 
 * Buzzer:
 *   PIN -> GPIO 25
 * 
 * LED:
 *   PIN -> GPIO 2 (built-in LED)
 * 
 * Serial Communication Protocol:
 * - Baud Rate: 115200
 * - Format: JSON messages
 * - Command: {"type":"scan","uid":"ABC123"}
 * - Response: {"success":true,"balance":100.50,"message":"Payment successful"}
 */

#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// ========================
// Pin Configuration
// ========================

#define RST_PIN     22
#define SS_PIN      5
#define BUZZER_PIN  25
#define LED_PIN     2

// ========================
// RFID Instance
// ========================

MFRC522 rfid(SS_PIN, RST_PIN);

// ========================
// Global Variables
// ========================

String lastCardUID = "";
unsigned long lastScanTime = 0;
const unsigned long SCAN_COOLDOWN = 2000; // 2 seconds between same card scans

// ========================
// Helper Functions
// ========================

// Buzzer feedback
void playSuccessBeep() {
  tone(BUZZER_PIN, 2000, 100);
  delay(150);
  tone(BUZZER_PIN, 2500, 100);
}

void playErrorBeep() {
  tone(BUZZER_PIN, 500, 200);
  delay(250);
  tone(BUZZER_PIN, 500, 200);
}

void playBeep(int freq, int duration) {
  tone(BUZZER_PIN, freq, duration);
}

// LED feedback
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
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

// Send JSON message to computer
void sendMessage(String type, String uid = "", JsonObject data = JsonObject()) {
  DynamicJsonDocument doc(1024);
  doc["type"] = type;
  doc["timestamp"] = millis();
  
  if (uid != "") {
    doc["uid"] = uid;
  }
  
  // Add additional data if provided
  if (!data.isNull()) {
    for (JsonPair kv : data) {
      doc[kv.key()] = kv.value();
    }
  }
  
  serializeJson(doc, Serial);
  Serial.println(); // End of message
}

// Send card scan event
void sendCardScan(String uid) {
  DynamicJsonDocument doc(512);
  doc["type"] = "scan";
  doc["uid"] = uid;
  doc["timestamp"] = millis();
  
  serializeJson(doc, Serial);
  Serial.println();
}

// Send ready status
void sendReady() {
  DynamicJsonDocument doc(256);
  doc["type"] = "ready";
  doc["message"] = "ESP32 RFID reader ready";
  doc["timestamp"] = millis();
  
  serializeJson(doc, Serial);
  Serial.println();
}

// Send error
void sendError(String errorMsg) {
  DynamicJsonDocument doc(512);
  doc["type"] = "error";
  doc["message"] = errorMsg;
  doc["timestamp"] = millis();
  
  serializeJson(doc, Serial);
  Serial.println();
}

// Process incoming commands from computer
void processCommand(String command) {
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, command);
  
  if (error) {
    sendError("Invalid JSON command");
    return;
  }
  
  String cmdType = doc["type"];
  
  if (cmdType == "ping") {
    // Respond to ping
    DynamicJsonDocument response(256);
    response["type"] = "pong";
    response["timestamp"] = millis();
    serializeJson(response, Serial);
    Serial.println();
    
  } else if (cmdType == "success") {
    // Payment successful - give feedback
    playSuccessBeep();
    blinkLED(3, 100);
    
  } else if (cmdType == "error" || cmdType == "failed") {
    // Payment failed - give feedback
    playErrorBeep();
    blinkLED(5, 50);
    
  } else if (cmdType == "config") {
    // Configuration update (if needed in future)
    // Can store config in EEPROM
    
  } else {
    sendError("Unknown command type: " + cmdType);
  }
}

// ========================
// Setup
// ========================

void setup() {
  // Initialize Serial (USB)
  Serial.begin(115200);
  while (!Serial) {
    ; // Wait for serial port to connect
  }
  
  delay(1000);
  
  // Initialize LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Startup beep
  playBeep(1000, 100);
  blinkLED(2, 200);
  
  // Initialize SPI and RFID
  SPI.begin();
  rfid.PCD_Init();
  
  // Check RFID reader
  byte v = rfid.PCD_ReadRegister(rfid.VersionReg);
  if (v == 0x00 || v == 0xFF) {
    sendError("RFID reader not found! Check wiring.");
    while (true) {
      playErrorBeep();
      delay(2000);
    }
  }
  
  // Send ready message
  sendReady();
  playBeep(2000, 200);
  blinkLED(3, 100);
}

// ========================
// Main Loop
// ========================

void loop() {
  // Check for incoming serial commands
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command.length() > 0) {
      processCommand(command);
    }
  }
  
  // Check for new RFID card
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Get card UID
  String uid = getCardUID();
  
  // Prevent duplicate scans
  unsigned long currentTime = millis();
  if (uid == lastCardUID && (currentTime - lastScanTime) < SCAN_COOLDOWN) {
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    return;
  }
  
  // Update last scan
  lastCardUID = uid;
  lastScanTime = currentTime;
  
  // Visual/audio feedback
  playBeep(1500, 50);
  digitalWrite(LED_PIN, HIGH);
  
  // Send card UID to computer
  sendCardScan(uid);
  
  // Halt PICC
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  // Turn off LED
  delay(100);
  digitalWrite(LED_PIN, LOW);
}
