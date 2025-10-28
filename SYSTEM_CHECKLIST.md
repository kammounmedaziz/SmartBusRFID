# ✅ SmartBus System Checklist

## Installation Status

### Backend
- [x] Dependencies installed (`npm install`)
- [x] `axios` installed for AI integration
- [x] Database configured
- [x] Face auth endpoints added
- [x] AI service integration complete

### Frontend
- [x] Dependencies installed (`npm install`)
- [x] `react-webcam` installed
- [x] Face capture component created
- [x] Face login component created
- [x] Face settings component created
- [x] Auth page updated
- [x] Dashboard updated

### AI Server
- [ ] Python installed (check: `python --version`)
- [ ] Virtual environment created (`python -m venv venv`)
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] app.py exists in smart-bus-ai folder
- [ ] Face recognition model ready

### Scripts
- [x] `start.ps1` - Auto-start all services
- [x] `stop.ps1` - Stop all services
- [x] `status.ps1` - Check service status
- [x] `check-dependencies.ps1` - Verify AI deps

---

## Testing Checklist

### Before First Run
```powershell
# 1. Check AI dependencies
cd smart-bus-ai
.\check-dependencies.ps1

# 2. Return to root
cd ..

# 3. Start all services
.\start.ps1
```

### Verify Services Running
```powershell
# Check status
.\status.ps1
```

Expected output:
- ✓ AI Server running on port 8000
- ✓ Backend running on port 5000
- ✓ Frontend accessible on port 5173

### Test Face Authentication

#### 1. Register with Face
- [ ] Go to http://localhost:5173/auth
- [ ] Click "Register" tab
- [ ] Fill name, email, password
- [ ] Check "Enable Face Login"
- [ ] Click "Capture Face"
- [ ] Camera preview appears
- [ ] Capture photo shows preview
- [ ] Click "Register"
- [ ] Check response includes `face_registered: true`

#### 2. Login with Password
- [ ] Logout
- [ ] Enter email and password
- [ ] Click "Login"
- [ ] Redirected to dashboard

#### 3. Login with Face
- [ ] Logout
- [ ] Click "Login with Face" tab
- [ ] Camera preview appears
- [ ] Click "Capture & Login"
- [ ] Face verified and logged in
- [ ] Redirected to dashboard

#### 4. Enable Face Auth (Existing User)
- [ ] Login with password
- [ ] Go to dashboard
- [ ] Find "Face Authentication" section
- [ ] Toggle "Enable Face Authentication"
- [ ] Click "Enable Face Login"
- [ ] Capture face
- [ ] Success message appears
- [ ] Logout and test face login

#### 5. Disable Face Auth
- [ ] Login
- [ ] Go to face settings
- [ ] Click "Disable Face Login"
- [ ] Confirmation appears
- [ ] Face auth removed

---

## API Endpoint Tests

### Health Checks
```powershell
# AI Server
curl http://localhost:8000/health

# Backend (if health endpoint exists)
curl http://localhost:5000/api/health
```

### Face Registration
```bash
POST http://localhost:8000/ai/face/register
Content-Type: application/json

{
  "user_id": 1,
  "image": "base64_image_here",
  "name": "Test User"
}
```

### Face Verification
```bash
POST http://localhost:8000/ai/face/verify
Content-Type: application/json

{
  "image": "base64_image_here"
}
```

---

## Common Issues

### Issue: "Cannot find package 'axios'"
**Solution:**
```powershell
cd smart-bus-backend
npm install axios
```

### Issue: "Cannot find module 'react-webcam'"
**Solution:**
```powershell
cd smart-bus-frontend
npm install react-webcam
```

### Issue: "Python not found"
**Solution:**
- Install Python 3.8 or higher
- Add to PATH
- Restart terminal

### Issue: "AI Server not starting"
**Solution:**
```powershell
cd smart-bus-ai
.\check-dependencies.ps1
```

### Issue: "Camera not working"
**Solution:**
- Use HTTPS or localhost
- Grant browser camera permissions
- Check if AI server is running

### Issue: "Port already in use"
**Solution:**
```powershell
# Find process
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F
```

---

## Performance Checks

### Expected Response Times
- Face registration: < 3 seconds
- Face verification: < 2 seconds
- Login (password): < 500ms
- Login (face): < 3 seconds

### Resource Usage
- AI Server: ~500MB RAM (with models loaded)
- Backend: ~100MB RAM
- Frontend (dev): ~200MB RAM

---

## Security Checklist

- [ ] JWT_SECRET configured in backend .env
- [ ] Database credentials secured
- [ ] HTTPS enabled in production
- [ ] Camera permissions requested properly
- [ ] Face embeddings stored securely
- [ ] No sensitive data in logs
- [ ] Rate limiting on auth endpoints

---

## Production Readiness

### Before Deployment
- [ ] Build frontend (`npm run build`)
- [ ] Set NODE_ENV=production
- [ ] Configure reverse proxy (nginx)
- [ ] Enable SSL/TLS
- [ ] Set up process managers (PM2, systemd)
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Database backups configured
- [ ] Environment variables secured

### Production Scripts Needed
- [ ] systemd service for AI server
- [ ] PM2 ecosystem file for backend
- [ ] nginx config for frontend
- [ ] Automated backups
- [ ] Health check monitoring

---

## Documentation

- [x] `FACE_AUTH_INTEGRATION.md` - Complete integration guide
- [x] `AUTO_START_SUMMARY.md` - Auto-start configuration
- [x] `STARTUP_GUIDE.md` - Scripts documentation
- [x] `QUICK_REFERENCE.txt` - Quick commands
- [x] `SYSTEM_CHECKLIST.md` - This file

---

## Next Steps

1. **Complete AI Server Setup**
   ```powershell
   cd smart-bus-ai
   python -m venv venv
   venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. **Test Everything**
   ```powershell
   .\start.ps1
   .\status.ps1
   ```

3. **Register and Test Face Auth**
   - Navigate to http://localhost:5173
   - Test all face auth flows

4. **Review Documentation**
   - Read `FACE_AUTH_INTEGRATION.md`
   - Review API endpoints

5. **Prepare for Production**
   - Review security checklist
   - Set up production environment
   - Configure deployment scripts

---

## Success Criteria

✅ All three services start automatically
✅ Face registration works during signup
✅ Face login authenticates correctly
✅ Existing users can enable face auth
✅ Settings allow disabling face auth
✅ No errors in any console
✅ Response times acceptable
✅ Camera permissions work properly

**Status: Ready for testing!** 🎉

Run `.\start.ps1` to begin!
