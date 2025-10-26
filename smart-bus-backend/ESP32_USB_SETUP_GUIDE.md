# SmartBus ESP32 USB Serial - Complete Setup Guide

## 🎯 Overview

This guide shows you how to set up the **ESP32 RFID payment system using USB serial communication** instead of WiFi. This is simpler, more reliable, and doesn't require network configuration.

## 📋 What You Need

### Hardware
- ✅ ESP32 Dev Board
- ✅ MFRC522 RFID Reader Module
- ✅ USB Cable (for ESP32 connection to computer)
- ✅ Buzzer (optional, for audio feedback)
- ✅ Jumper wires

### Software
- ✅ Arduino IDE
- ✅ Node.js (already installed)
- ✅ SerialPort library (already installed)

---

## 🔧 Hardware Setup

### Pin Connections

Connect the MFRC522 RFID reader to ESP32:

```
MFRC522          ESP32
--------         ------
SDA     ------>  GPIO 5
SCK     ------>  GPIO 18
MOSI    ------>  GPIO 23
MISO    ------>  GPIO 19
IRQ     ------>  (not connected)
GND     ------>  GND
RST     ------>  GPIO 22
3.3V    ------>  3.3V
```

### Optional Buzzer
```
Buzzer (+) ---> GPIO 25
Buzzer (-) ---> GND
```

### Optional LED
Built-in LED on GPIO 2 is used automatically.

---

## 💻 Arduino Setup

### 1. Install Required Libraries

Open Arduino IDE and install these libraries:
- Go to **Tools → Manage Libraries**
- Search and install:
  - `MFRC522` by GithubCommunity
  - `ArduinoJson` by Benoit Blanchon (version 6.x)

### 2. Upload Arduino Code

1. Open `examples/ESP32_SmartBus_RFID_USB.ino` in Arduino IDE
2. Select your ESP32 board:
   - **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
3. Select the correct COM port:
   - **Tools → Port → COM3** (or your ESP32's port)
4. Click **Upload** ✅

### 3. Test the Connection

1. After upload, open **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```json
   {"type":"ready","message":"ESP32 RFID reader ready","timestamp":1234}
   ```

---

## 🖥️ Backend Setup

### 1. Environment Configuration

Your `.env` file should already have:
```env
DEFAULT_FARE=50
PAYMENT_COOLDOWN=60
```

### 2. Find Your COM Port

**On Windows:**
```powershell
# List all COM ports
node start-esp32-usb.js
```

**On Linux:**
```bash
ls /dev/ttyUSB*
ls /dev/ttyACM*
```

**On Mac:**
```bash
ls /dev/cu.*
```

### 3. Start the USB Serial Service

**Windows:**
```powershell
node start-esp32-usb.js COM3
```

**Linux:**
```bash
node start-esp32-usb.js /dev/ttyUSB0
```

**Mac:**
```bash
node start-esp32-usb.js /dev/cu.usbserial-0001
```

---

## 🎮 How It Works

### Communication Flow

```
[ESP32] --USB--> [Computer] --Serial--> [Node.js Backend] ---> [Database]
   ↑                                                                 |
   |                                                                 |
   └─────────────────← Response (Success/Error) ←───────────────────┘
```

### Step-by-Step Process

1. **Card Scan**: User taps RFID card on reader
2. **ESP32 Reads**: ESP32 reads card UID and sends to computer
3. **Backend Validates**: Node.js checks card status and balance
4. **Payment Processing**: If valid, deducts fare and creates transaction
5. **Feedback**: ESP32 receives response and gives buzzer/LED feedback

---

## 📡 Message Protocol

### ESP32 → Computer (Card Scan)
```json
{
  "type": "scan",
  "uid": "ABC123",
  "timestamp": 12345
}
```

### Computer → ESP32 (Success)
```json
{
  "type": "success",
  "message": "Payment successful",
  "transaction": {
    "id": 123,
    "card_holder": "John Doe",
    "fare_charged": 50,
    "new_balance": 150.50,
    "timestamp": "2025-10-26T10:30:00"
  }
}
```

### Computer → ESP32 (Error)
```json
{
  "type": "error",
  "message": "Insufficient balance",
  "error_code": "INSUFFICIENT_BALANCE",
  "shortage": 25.50
}
```

---

## 🧪 Testing

### 1. Start Backend
```powershell
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-backend"
node start-esp32-usb.js COM3
```

### 2. Scan Test Card

Tap an RFID card on the reader. You should see:

**In Serial Monitor (ESP32):**
```json
{"type":"scan","uid":"ABC123","timestamp":12345}
```

**In Node.js Console:**
```
📨 Received from ESP32: { type: 'scan', uid: 'ABC123', timestamp: 12345 }
💳 Processing card: ABC123
👤 Card holder: John Doe
💰 Balance: 200 T-Pay
✅ Payment successful!
   Transaction ID: 456
   New balance: 150 T-Pay
📤 Sent to ESP32: { type: 'success', message: 'Payment successful', ... }
```

**ESP32 Feedback:**
- ✅ **Success**: 2 quick beeps, LED blinks 3 times
- ❌ **Error**: 2 low beeps, LED blinks 5 times rapidly

---

## 🔧 Configuration

### Update Device Info

You can update device configuration programmatically:

```javascript
import esp32Service from './services/esp32SerialService.js';

esp32Service.updateConfig({
  device_id: 'BUS_001',
  location: 'City Center Route',
  defaultFare: 75,
  cooldownSeconds: 30
});
```

---

## 🐛 Troubleshooting

### ESP32 Not Found

**Problem**: "Failed to connect to ESP32"

**Solutions**:
1. Check USB cable (must support data, not just power)
2. Install CH340/CP2102 USB driver if needed
3. Check Device Manager (Windows) for correct COM port
4. Close Serial Monitor in Arduino IDE
5. Try different USB port

### RFID Not Working

**Problem**: "RFID reader not found! Check wiring."

**Solutions**:
1. Verify all pin connections
2. Check 3.3V power (NOT 5V!)
3. Try different MFRC522 module
4. Re-upload Arduino code

### Card Not Detected

**Problem**: No response when scanning card

**Solutions**:
1. Check if card is compatible (13.56MHz RFID)
2. Hold card closer to reader (2-3cm max)
3. Remove any metal interference
4. Check Serial Monitor for debug messages

### Payment Errors

**Problem**: "Card not found" or "Insufficient balance"

**Solutions**:
1. Make sure card exists in database (check `cards` table)
2. Verify card status is 'active'
3. Check card balance is >= DEFAULT_FARE
4. Wait for cooldown period (60 seconds between payments)

---

## 🚀 Running in Production

### 1. Create a Service (Windows)

Create `start-esp32.bat`:
```batch
@echo off
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-backend"
node start-esp32-usb.js COM3
pause
```

### 2. Auto-Start on Boot

Use Windows Task Scheduler:
1. Create new task
2. Trigger: At system startup
3. Action: Start program → `start-esp32.bat`
4. Conditions: Start only if computer is on AC power

### 3. Service Manager (Linux)

Create `/etc/systemd/system/smartbus-esp32.service`:
```ini
[Unit]
Description=SmartBus ESP32 USB Service
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/smart-bus-backend
ExecStart=/usr/bin/node start-esp32-usb.js /dev/ttyUSB0
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable smartbus-esp32
sudo systemctl start smartbus-esp32
```

---

## 📊 Features

### ✅ Implemented
- ✅ USB serial communication
- ✅ Automatic card scanning
- ✅ Payment processing with validation
- ✅ Card status check (active/blocked)
- ✅ Balance verification
- ✅ Rate limiting (60s cooldown)
- ✅ Transaction logging
- ✅ Buzzer feedback
- ✅ LED feedback
- ✅ Error handling
- ✅ Connection monitoring

### 🔄 Optional Enhancements
- LCD display for card info
- Multiple readers support
- Offline mode with sync
- Receipt printer integration
- Admin commands via serial

---

## 📝 Quick Reference

### Important Files
- `examples/ESP32_SmartBus_RFID_USB.ino` - ESP32 Arduino code
- `services/esp32SerialService.js` - Serial communication service
- `start-esp32-usb.js` - Main startup script
- `.env` - Configuration (DEFAULT_FARE, PAYMENT_COOLDOWN)

### Commands
```powershell
# List available ports
node start-esp32-usb.js

# Start with specific port
node start-esp32-usb.js COM3

# Start with custom baud rate
node start-esp32-usb.js COM3 115200
```

### Error Codes
- `CARD_NOT_FOUND` - Card UID not in database
- `CARD_BLOCKED` - Card status is not 'active'
- `INSUFFICIENT_BALANCE` - Balance < required fare
- `RATE_LIMITED` - Payment too soon (wait cooldown period)
- `SYSTEM_ERROR` - Backend error (check logs)

---

## 🎯 Next Steps

1. ✅ Upload Arduino code to ESP32
2. ✅ Connect RFID reader
3. ✅ Start serial service
4. ✅ Test with real cards
5. ✅ Monitor transactions in database
6. ✅ Deploy to production bus

---

## 📞 Support

If you encounter issues:
1. Check Arduino Serial Monitor for ESP32 errors
2. Check Node.js console for backend errors
3. Verify database connection
4. Test card manually in frontend

**System is ready for production! 🚀**
