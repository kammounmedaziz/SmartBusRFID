# 🎴 RFID Card Registration - User Guide

## Overview

Users can now register new RFID cards directly through the **Card Management** interface by scanning physical cards with the ESP32 RFID reader connected via USB.

---

## 🚀 How It Works

### Flow

```
[User clicks "Scan Card with RFID"] 
    ↓
[Backend puts ESP32 in registration mode]
    ↓
[User taps RFID card on reader]
    ↓
[ESP32 reads card UID and sends to backend]
    ↓
[UID appears in the form automatically]
    ↓
[User clicks "Add Card" to register]
```

---

## 📋 Setup Requirements

### 1. ESP32 Must Be Connected

Before users can scan cards, ensure:
- ✅ ESP32 is connected via USB (COM5)
- ✅ `node start-esp32-usb.js COM5` is running
- ✅ Console shows "✅ ESP32 connected successfully!"

### 2. User Must Be Logged In

- ✅ User must be authenticated (have valid JWT token)
- ✅ User role must be 'user' (client/passenger)

---

## 🎯 User Interface

### Card Management Page

Users will see the **"Add new card"** section with:

1. **Scan Card with RFID** button (purple/pink gradient)
   - Click to start scanning
   - Shows "Scanning... (30s)" when active
   - 30-second timeout for card detection

2. **Card UID** input field
   - Auto-fills when card is scanned
   - Can also be entered manually
   - Has clear button (X) when filled

3. **Initial balance** input (optional)
   - Set starting balance for the card
   - Defaults to 0 if left empty

4. **Add Card** button
   - Creates the card in the database
   - Links card to logged-in user

---

## 📱 Step-by-Step Usage

### For Users

1. **Navigate to Card Management**
   - Log in to your account
   - Go to "Card Management" section

2. **Click "Scan Card with RFID"**
   - Purple button with RFID icon
   - Button shows spinner while scanning

3. **Place Card on Reader**
   - Yellow alert box appears: "📡 Waiting for card..."
   - Tap your RFID card on the MFRC522 reader
   - Keep card near reader for 1-2 seconds

4. **Card UID Detected**
   - Success message: "✅ Card scanned successfully! UID: ABC123"
   - UID automatically fills the input field

5. **Set Initial Balance** (Optional)
   - Enter amount in "Initial balance" field
   - Leave empty for 0 balance

6. **Click "Add Card"**
   - Card is registered to your account
   - Card list refreshes automatically

---

## ⚡ Features

### Automatic UID Detection
- No manual typing of complex UIDs
- Prevents typos and errors
- Faster card registration

### Real-Time Feedback
- Scanning status indicator
- Visual countdown (30 seconds)
- Success/error messages

### Dual Mode Support
- **Registration Mode**: When scanning for new cards
- **Payment Mode**: When processing bus payments
- Automatic switching between modes

### Security
- JWT authentication required
- Each card linked to specific user
- Cannot scan cards for other users

---

## 🔧 Technical Details

### Backend API

**Endpoint**: `POST /api/cards/me/scan-rfid`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**:
- `timeout` (optional): Timeout in milliseconds (default: 30000)

**Response (Success)**:
```json
{
  "success": true,
  "uid": "ABC123DEF",
  "message": "Card scanned successfully"
}
```

**Response (Timeout)**:
```json
{
  "error": "Scan timeout",
  "message": "No card was scanned within the time limit. Please try again."
}
```

**Response (ESP32 Not Connected)**:
```json
{
  "error": "ESP32 RFID reader not connected",
  "message": "Please ensure the ESP32 is connected via USB"
}
```

**Response (Scan In Progress)**:
```json
{
  "error": "Registration already in progress",
  "message": "Another scan is in progress. Please wait."
}
```

### ESP32 Service

**Registration Mode Methods**:

```javascript
// Enter registration mode (returns Promise with scanned UID)
await esp32Service.enterRegistrationMode(30000);

// Exit registration mode
esp32Service.exitRegistrationMode();

// Check if in registration mode
esp32Service.isInRegistrationMode();
```

**Mode Switching**:
- ESP32 receives `{"type":"mode","mode":"registration"}` when entering scan mode
- ESP32 receives `{"type":"mode","mode":"payment"}` when exiting scan mode
- Arduino code can use these to show LED/buzzer feedback

---

## 🐛 Error Handling

### ESP32 Not Connected (503)
```
❌ ESP32 RFID reader not connected.
Please ensure the ESP32 is connected via USB.
```

**Solution**: 
1. Check USB cable connection
2. Run `node start-esp32-usb.js COM5`
3. Verify "✅ ESP32 connected successfully!" message

### Scan Timeout (408)
```
⏰ Scan timeout.
No card was detected within 30 seconds.
Please try again.
```

**Solution**:
1. Hold card closer to reader (2-3cm)
2. Try different card
3. Check RFID reader wiring

### Scan Already In Progress (409)
```
⚠️ A scan is already in progress.
Please wait and try again.
```

**Solution**:
1. Wait for current scan to finish (30s timeout)
2. Refresh page if stuck

### Card Already Exists
```
Failed to create card
Card with this UID already exists
```

**Solution**:
1. Check if card is already registered
2. View "Your Cards" section
3. Use different card

---

## 💡 Best Practices

### For Users
1. **Wait for "Scanning..."** indicator before placing card
2. **Hold card steady** for 1-2 seconds
3. **Check UID** is filled before clicking "Add Card"
4. **Set initial balance** to avoid zero-balance cards

### For Administrators
1. **Keep ESP32 running** during business hours
2. **Monitor console** for registration activity
3. **Test regularly** with sample cards
4. **Document COM port** for troubleshooting

### For Operators
1. **Help users** position cards correctly
2. **Verify successful** registration
3. **Recharge cards** after registration if needed

---

## 🎓 Example Workflow

### New User Onboarding

1. **User registers account** (name, email, password)
2. **User logs in** to dashboard
3. **User navigates** to Card Management
4. **User clicks** "Scan Card with RFID"
5. **Operator helps** user place card on reader
6. **Card scanned** successfully (UID: F8E2A1D3)
7. **User sets** initial balance: 100 T-Pay
8. **User clicks** "Add Card"
9. **Card registered** and ready to use
10. **User can now** make bus payments with this card

---

## 📊 Monitoring

### Backend Console Output

**Registration Started**:
```
🎴 Starting card scan for user: 12
🎴 Entering card registration mode...
⏰ Waiting 30 seconds for card scan...
📤 Sent to ESP32: { type: 'mode', mode: 'registration', ... }
```

**Card Scanned**:
```
📨 Received from ESP32: { type: 'scan', uid: 'ABC123', timestamp: 12345 }
🎴 Card scanned for registration: ABC123
✅ Exited registration mode
📤 Sent to ESP32: { type: 'mode', mode: 'payment', ... }
```

**Timeout**:
```
❌ Registration timeout - no card scanned
✅ Exited registration mode
```

---

## 🔐 Security Considerations

1. **Authentication Required**: Only logged-in users can scan cards
2. **User Ownership**: Cards are automatically linked to scanning user
3. **No Cross-User Access**: Users cannot scan cards for other users
4. **Rate Limiting**: One scan at a time (prevents abuse)
5. **Timeout Protection**: 30-second limit prevents hanging connections

---

## 🚦 Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | Success | Card scanned successfully |
| 408 | Request Timeout | No card detected in 30s |
| 409 | Conflict | Another scan in progress |
| 503 | Service Unavailable | ESP32 not connected |

---

## 📞 Troubleshooting Guide

### Issue: Button disabled/grayed out
**Cause**: Scan already in progress
**Fix**: Wait 30 seconds or refresh page

### Issue: "ESP32 not connected" error
**Cause**: USB service not running
**Fix**: Run `node start-esp32-usb.js COM5`

### Issue: Card not detected
**Cause**: Card too far from reader
**Fix**: Hold card 1-3cm from reader center

### Issue: Wrong UID scanned
**Cause**: Multiple cards nearby
**Fix**: Remove other cards, click clear (X), scan again

### Issue: Duplicate UID error
**Cause**: Card already registered
**Fix**: Check existing cards or use different card

---

## ✅ Success Checklist

Before allowing users to scan cards:

- [ ] ESP32 connected via USB
- [ ] `start-esp32-usb.js` running
- [ ] Console shows "ESP32 connected successfully"
- [ ] RFID reader wired correctly
- [ ] Test card scans successfully
- [ ] Frontend loads without errors
- [ ] User authentication working
- [ ] Database connection active

---

**Your RFID card registration system is ready! 🎉**
