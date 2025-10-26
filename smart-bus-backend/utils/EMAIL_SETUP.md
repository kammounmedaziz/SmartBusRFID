# 📧 SmartBus Email System Documentation

## Overview
This email system automatically sends confirmation emails to users when they perform transactions (payments and recharges) on their SmartBus cards.

## Features
- ✅ **Payment Confirmation Emails** - Sent after successful card payments
- ✅ **Recharge Confirmation Emails** - Sent after successful card recharges
- ✅ **Beautiful HTML Templates** - Professional, responsive email designs
- ✅ **Non-blocking** - Emails are sent asynchronously without slowing down API responses
- ✅ **Error Handling** - Email failures don't break the payment flow
- ✅ **Configurable** - Easy to switch between email providers

---

## Setup Instructions

### 1. Install Dependencies
Already done! Nodemailer is installed in `package.json`.

### 2. Configure Environment Variables

Open your `.env` file and configure the SMTP settings:

```env
# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=no-reply@smartbus.com
```

### 3. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "SmartBus Backend"
4. Click "Generate"
5. Copy the 16-character password
6. Paste it in `.env` as `SMTP_PASS`

#### Step 3: Update .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youremail@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=no-reply@smartbus.com
```

### 4. Alternative Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
```

---

## Testing

### Test with Sample Data

1. **Update test email address:**
   Edit `utils/test-email.js` and change `userEmail` to your actual email:
   ```javascript
   userEmail: 'your-actual-email@example.com',
   ```

2. **Run the test script:**
   ```bash
   node utils/test-email.js
   ```

3. **Expected output:**
   ```
   🧪 SmartBus Email Test Script
   ==================================================

   📧 Test 1: Payment Confirmation Email
   --------------------------------------------------
   Sending payment confirmation to: your-email@example.com
   📧 Sending payment confirmation email to: your-email@example.com
   ✅ Email sent successfully! Message ID: <...@...>
   ✅ Payment email sent successfully!
      Message ID: <...@...>
      Recipient: your-email@example.com

   📧 Test 2: Recharge Confirmation Email
   --------------------------------------------------
   Sending recharge confirmation to: your-email@example.com
   📧 Sending recharge confirmation email to: your-email@example.com
   ✅ Email sent successfully! Message ID: <...@...>
   ✅ Recharge email sent successfully!
      Message ID: <...@...>
      Recipient: your-email@example.com
   ```

4. **Check your inbox** (and spam folder!)

### Test with Real Payment

1. Start your server:
   ```bash
   npm run dev
   ```

2. Make a payment request to `/api/cards/pay`:
   ```bash
   POST http://localhost:5000/api/cards/pay
   Authorization: Bearer YOUR_JWT_TOKEN
   Content-Type: application/json

   {
     "card_id": 1,
     "amount": 50
   }
   ```

3. Check the server console for email logs:
   ```
   📧 Sending payment confirmation email to: user@example.com
   ✅ Email sent successfully! Message ID: <...>
   ```

4. Check your email inbox!

---

## Email Templates

### Payment Confirmation Email
**Subject:** ✅ Payment Confirmation - SmartBus

**Contains:**
- Success icon and header
- User's name (personalized greeting)
- Card UID
- Amount paid (in T-Pay)
- Remaining balance
- Transaction date and time
- SmartBus branding

### Recharge Confirmation Email
**Subject:** 💰 Recharge Confirmation - SmartBus

**Contains:**
- Success icon and header
- User's name
- Card UID
- Amount recharged (in T-Pay)
- New balance
- Transaction date and time
- SmartBus branding

---

## Code Structure

### Files Added/Modified

```
smart-bus-backend/
├── utils/
│   ├── mailer.js          # 📧 Main email utility (NEW)
│   ├── test-email.js      # 🧪 Email testing script (NEW)
│   └── EMAIL_SETUP.md     # 📖 This documentation (NEW)
├── controllers/
│   └── cardController.js  # ✏️  Modified to send emails
└── .env                   # ✏️  Added SMTP configuration
```

### mailer.js Functions

#### `sendPaymentConfirmation(paymentData)`
Sends a payment confirmation email.

**Parameters:**
```javascript
{
  userEmail: string,        // Required - recipient email
  userName: string,         // Optional - user's name
  cardUid: string,          // Required - card UID
  amount: number,           // Required - amount paid
  remainingBalance: number, // Required - balance after payment
  timestamp: Date           // Optional - transaction time (defaults to now)
}
```

**Returns:**
```javascript
{
  success: boolean,
  messageId: string,  // Email message ID (if success)
  recipient: string,  // Email address
  error: string       // Error message (if failed)
}
```

#### `sendRechargeConfirmation(rechargeData)`
Sends a recharge confirmation email.

**Parameters:**
```javascript
{
  userEmail: string,    // Required - recipient email
  userName: string,     // Optional - user's name
  cardUid: string,      // Required - card UID
  amount: number,       // Required - amount recharged
  newBalance: number,   // Required - balance after recharge
  timestamp: Date       // Optional - transaction time
}
```

---

## How It Works

### Payment Flow with Email

1. **User makes payment** via `/api/cards/pay` endpoint
2. **Transaction is processed** (database updates)
3. **Payment succeeds** - transaction committed
4. **User data is fetched** from database
5. **Email is triggered** asynchronously (non-blocking)
6. **API response sent** immediately (doesn't wait for email)
7. **Email sends in background**
8. **Logs success/failure** to console

### Key Features

#### Non-blocking
Emails are sent asynchronously using `.catch()` instead of `await`:
```javascript
sendPaymentConfirmation(data).catch(err => {
  console.error('Email failed:', err);
});
// API continues immediately
```

#### Graceful Failure
Email failures don't break the payment:
```javascript
if (user && user.email) {
  // Only send if user has email
  sendPaymentConfirmation(...).catch(err => {
    // Log but don't throw
    console.error('Failed to send email:', err);
  });
} else {
  console.warn('⚠️  User email not found. Skipping email.');
}
```

---

## Troubleshooting

### Email Not Sending

**Check 1: SMTP Credentials**
```bash
# Verify .env has correct values
cat .env | grep SMTP
```

**Check 2: Console Logs**
Look for these messages in your server console:
- ✅ `📧 Sending payment confirmation email to: ...`
- ✅ `✅ Email sent successfully! Message ID: ...`
- ❌ `❌ Error sending payment confirmation email: ...`

**Check 3: Gmail App Password**
- Make sure you're using an App Password, not your regular password
- App Password should be 16 characters with no spaces

**Check 4: Port Blocked**
Some networks block port 587. Try port 465:
```env
SMTP_PORT=465
SMTP_SECURE=true
```

### Common Errors

#### "Invalid login"
- Wrong email or password
- Not using App Password for Gmail
- 2FA not enabled (required for Gmail)

#### "Connection timeout"
- Firewall blocking SMTP port
- Wrong SMTP host
- Network issue

#### "User email not found"
- User doesn't have email in database
- Check: `SELECT email FROM users WHERE id = ?`

---

## Best Practices

### 1. Environment Variables
Never hardcode credentials! Always use `.env`:
```javascript
// ✅ Good
const user = process.env.SMTP_USER;

// ❌ Bad
const user = 'myemail@gmail.com';
```

### 2. Error Handling
Always catch email errors:
```javascript
sendEmail(data).catch(err => {
  console.error('Email failed:', err);
  // Log to monitoring service
});
```

### 3. Rate Limits
Gmail has sending limits:
- **500 emails/day** for free accounts
- **2000 emails/day** for Google Workspace

For production, use dedicated email services:
- SendGrid (100 emails/day free)
- Mailgun (5000 emails/month free)
- AWS SES (62,000 emails/month free)

### 4. Email Validation
Ensure user emails are valid:
```javascript
if (user && user.email && user.email.includes('@')) {
  sendEmail(...);
}
```

---

## Production Checklist

Before deploying to production:

- [ ] Use a dedicated email service (SendGrid, Mailgun, etc.)
- [ ] Set up proper SPF and DKIM records for your domain
- [ ] Implement email rate limiting
- [ ] Add email queue system (Bull, Bee-Queue)
- [ ] Log email failures to monitoring service
- [ ] Create email templates for other events (password reset, welcome, etc.)
- [ ] Add unsubscribe functionality
- [ ] Test emails across different clients (Gmail, Outlook, Apple Mail)
- [ ] Add email preferences in user settings

---

## Future Enhancements

Potential improvements:
- 📱 SMS notifications
- 🔔 Push notifications
- 📊 Email analytics
- 🎨 Template customization by user
- 🌍 Multi-language support
- 📅 Weekly/monthly transaction summaries
- ⚠️ Low balance alerts
- 🔐 2FA via email

---

## Support

If you encounter issues:
1. Check server console logs
2. Test with `node utils/test-email.js`
3. Verify SMTP credentials
4. Check spam folder
5. Review this documentation

---

**Built with ❤️ for SmartBus**
