# 🚀 Quick Email Setup Guide

## 1. Configure Gmail (5 minutes)

### Enable App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (Custom name)"
3. Name it "SmartBus"
4. Click Generate
5. Copy the 16-character password

### Update .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youremail@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # <- Paste your app password here
SMTP_FROM=no-reply@smartbus.com
```

## 2. Test Email System

### Update test email:
Edit `utils/test-email.js` line 13:
```javascript
userEmail: 'your-actual-email@gmail.com',  // Change this!
```

### Run test:
```bash
node utils/test-email.js
```

### Expected output:
```
✅ Email sent successfully!
```

## 3. Test with Real Payment

### Start server:
```bash
npm run dev
```

### Make a payment:
Use Postman or your frontend to make a payment. Email will be sent automatically!

### Check console:
```
📧 Sending payment confirmation email to: user@example.com
✅ Email sent successfully! Message ID: <...>
```

---

## Troubleshooting

**No email received?**
- Check spam folder
- Verify SMTP_USER and SMTP_PASS in .env
- Make sure you're using Gmail App Password (not regular password)
- Check server console for error messages

**"Invalid login" error?**
- Enable 2-Factor Authentication on your Google account
- Generate a new App Password
- Make sure there are no spaces in the password

---

## Done! 🎉

Your email system is now ready. Users will receive beautiful confirmation emails for:
- ✅ Card payments
- ✅ Card recharges

For detailed documentation, see `utils/EMAIL_SETUP.md`
