# 🎯 ESP32 USB Quick Start - 3 Minutes to First Payment!

## Get Started in 3 Steps!

### 1️⃣ Upload Arduino Code (1 min)
1. Open Arduino IDE
2. Install libraries: `MFRC522` and `ArduinoJson`
3. Open `examples/ESP32_SmartBus_RFID_USB.ino`
4. Select board: **ESP32 Dev Module**
5. Click **Upload** ✅

### 2️⃣ Connect Hardware (1 min)
```
MFRC522 → ESP32
------------------
SDA  → GPIO 5
SCK  → GPIO 18
MOSI → GPIO 23
MISO → GPIO 19
RST  → GPIO 22
GND  → GND
3.3V → 3.3V

Buzzer (+) → GPIO 25
Buzzer (-) → GND
```

### 3️⃣ Start the System (1 min)

**Option A: Quick Test (Recommended)**
```powershell
.\test-usb.ps1
```

**Option B: Manual Start**
```powershell
# Find your COM port
node start-esp32-usb.js

# Connect (example: COM3)
node start-esp32-usb.js COM3
```

**Option C: Using NPM**
```powershell
npm run esp32:usb COM3
```

## ✅ That's It!

Your ESP32 is now ready to accept card payments via USB! 🎉

## 📋 What Happens Next?

1. **Scan a card** on the RFID reader
2. **ESP32 beeps** and sends UID to computer
3. **Backend processes** payment
4. **Success**: 2 quick beeps + LED blinks
5. **Error**: 2 low beeps

## 🔍 Check Status

### ESP32 Serial Monitor
```json
{"type":"ready","message":"ESP32 RFID reader ready","timestamp":1234}
```

### Computer Console
```
✅ ESP32 connected successfully!
🔄 Waiting for card scans...
```

## 🐛 Common Issues

### "Failed to connect"
- ✅ Check USB cable is connected
- ✅ Verify correct COM port in Device Manager
- ✅ Close Arduino Serial Monitor
- ✅ Install CH340/CP2102 driver if needed

### "RFID reader not found"
- ✅ Check all wire connections
- ✅ Make sure using 3.3V (NOT 5V!)
- ✅ Try different MFRC522 module

### "Card not detected"
- ✅ Use 13.56MHz RFID card (Mifare)
- ✅ Hold card closer (2-3cm from reader)
- ✅ Remove metal objects nearby

## 📚 Full Documentation

- **Setup Guide**: `ESP32_USB_SETUP_GUIDE.md`
- **WiFi vs USB**: `WIFI_VS_USB_COMPARISON.md`
- **WiFi Guide**: `ESP32_COMPLETE_GUIDE.md`

## ⚙️ Configuration

Edit `.env` file:
```env
DEFAULT_FARE=50           # Fare amount in T-Pay
PAYMENT_COOLDOWN=60       # Seconds between payments
ESP32_USB_PORT=COM3       # Your COM port
ESP32_DEVICE_ID=USB_DEVICE_001
ESP32_LOCATION=Bus Terminal
```

## 🚀 Production Tips

1. **Change default fare** if needed in `.env`
2. **Secure USB connection** (use cable ties)
3. **Monitor logs** for any errors
4. **Test with multiple cards** before deployment
5. **Keep Arduino code** as backup

## 💡 Pro Tips

- Use **short USB cable** for reliability
- Keep **RFID reader away** from metal surfaces
- Test **all card types** you'll accept
- Have **backup ESP32** ready
- Document your **COM port** for reference

## 🎓 Next Steps

1. ✅ Test with sample cards
2. ✅ Add real cards to database
3. ✅ Configure location and device ID
4. ✅ Deploy to production bus
5. ✅ Monitor transactions

---

**Need help?** Check `ESP32_USB_SETUP_GUIDE.md` for detailed instructions! 🎉
