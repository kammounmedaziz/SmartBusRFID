# 📋 Smart Bus AI Server - Installation Checklist

## ✅ Pre-Installation Requirements

- [ ] Python 3.8 or higher installed
- [ ] pip package manager available
- [ ] Visual Studio Build Tools (Windows) or build-essential (Linux)
- [ ] CMake installed (for dlib)
- [ ] At least 2GB free disk space
- [ ] Internet connection for downloading dependencies

## ✅ Step-by-Step Installation

### Step 1: Navigate to Project
```powershell
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-ai"
```
- [ ] Verified folder exists
- [ ] All files present (app.py, requirements.txt, etc.)

### Step 2: Create Virtual Environment
```powershell
python -m venv venv
```
- [ ] venv folder created successfully
- [ ] No errors during creation

### Step 3: Activate Virtual Environment
```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```
- [ ] Virtual environment activated
- [ ] Prompt shows (venv) prefix

### Step 4: Upgrade pip
```powershell
python -m pip install --upgrade pip
```
- [ ] pip upgraded to latest version

### Step 5: Install Dependencies
```powershell
pip install -r requirements.txt
```
- [ ] All packages installed successfully
- [ ] No fatal errors

#### If dlib fails (Windows):
```powershell
pip install dlib-binary
```
OR download pre-built wheel from:
https://github.com/z-mahmud22/Dlib_Windows_Python3.x

- [ ] dlib installed successfully
- [ ] face-recognition working

### Step 6: Download Vosk Model (OPTIONAL - for voice features)

1. Download model (39MB):
   https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

2. Extract to:
   ```
   smart-bus-ai\models\vosk\vosk-model-small-en-us-0.15\
   ```

3. Verify structure:
   ```
   models/vosk/vosk-model-small-en-us-0.15/
       ├── am/
       ├── conf/
       ├── graph/
       └── ivector/
   ```

- [ ] Model downloaded
- [ ] Extracted to correct location
- [ ] Folder structure verified

### Step 7: Configure Environment (OPTIONAL)
```powershell
copy .env.example .env
```

Edit `.env` file with your settings:
- [ ] Database credentials configured
- [ ] Server settings adjusted
- [ ] CORS origins updated

### Step 8: Test Installation
```powershell
# Test Python imports
python -c "import fastapi; import face_recognition; print('OK')"
```
- [ ] No import errors

### Step 9: Start Server
```powershell
python app.py
```
- [ ] Server starts without errors
- [ ] Shows "Starting Smart Bus AI Server..."
- [ ] Server running on http://localhost:8000

### Step 10: Verify Server
Open browser: http://localhost:8000/docs
- [ ] Interactive API documentation loads
- [ ] All endpoints visible
- [ ] Health check shows "online"

## ✅ Testing Installation

### Run Basic Tests
```powershell
# Install pytest if not already
pip install pytest

# Run tests
pytest tests/test_ai_endpoints.py::test_root_endpoint -v
pytest tests/test_ai_endpoints.py::test_health_check -v
```
- [ ] Basic tests pass
- [ ] No connection errors

### Test Each Feature

#### Face Recognition
```powershell
pytest tests/test_ai_endpoints.py::test_list_registered_faces -v
```
- [ ] Face endpoints accessible
- [ ] No errors

#### Voice Assistant
```powershell
pytest tests/test_ai_endpoints.py::test_voice_text_query -v
pytest tests/test_ai_endpoints.py::test_voice_commands_list -v
```
- [ ] Voice endpoints working
- [ ] Intent matching functional

#### Predictions
```powershell
pytest tests/test_ai_endpoints.py::test_predict_low_balance -v
pytest tests/test_ai_endpoints.py::test_model_info -v
```
- [ ] Prediction endpoints working
- [ ] Default model loaded

## ✅ Node.js Integration Setup

### Step 1: Verify Backend Structure
```
smart-bus-backend/
    └── services/
        └── aiService.js  ✓
```
- [ ] aiService.js exists in backend

### Step 2: Install axios (if needed)
```powershell
cd ..\smart-bus-backend
npm install axios
```
- [ ] axios installed in backend

### Step 3: Test Integration
Start both servers:
```powershell
# Terminal 1: AI Server
cd smart-bus-ai
.\start_ai.ps1

# Terminal 2: Backend
cd smart-bus-backend
npm start
```
- [ ] Both servers running
- [ ] No connection errors

### Step 4: Test from Node.js
Create test file `test-ai.js`:
```javascript
const aiService = require('./services/aiService');

async function test() {
  const health = await aiService.checkHealth();
  console.log('AI Server Health:', health);
}

test();
```
- [ ] Test file runs successfully
- [ ] Connection established

## ✅ Production Deployment Checklist

### Security
- [ ] Changed default CORS origins
- [ ] Set strong database passwords
- [ ] Disabled debug mode
- [ ] Configured proper logging

### Performance
- [ ] Increased worker count (uvicorn --workers 4)
- [ ] Configured reverse proxy (nginx)
- [ ] Set up SSL certificate
- [ ] Enabled response caching

### Monitoring
- [ ] Set up error tracking
- [ ] Configured log rotation
- [ ] Set up uptime monitoring
- [ ] Database connection pooling

### Backup
- [ ] Backed up face embeddings (models/faces/)
- [ ] Backed up trained models (models/ml/)
- [ ] Configured automatic backups
- [ ] Tested restore procedure

## ✅ Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'face_recognition'"
**Solution:**
```powershell
pip install face-recognition
# If fails, try:
pip install dlib-binary
pip install face-recognition
```
- [ ] Resolved

### Issue: "Vosk model not found"
**Solution:**
- Download model from https://alphacephei.com/vosk/models
- Extract to correct path
- Restart server
- [ ] Resolved

### Issue: "Port 8000 already in use"
**Solution:**
```python
# In app.py, change port:
uvicorn.run("app:app", port=8001)
```
- [ ] Resolved

### Issue: "Face not detected in image"
**Solution:**
- Ensure image is well-lit
- Face clearly visible
- Not too small
- Try different image
- [ ] Resolved

### Issue: "Database connection failed"
**Solution:**
- Check .env file
- Verify MariaDB running
- Test credentials
- Check firewall
- [ ] Resolved

## ✅ Final Verification

### Functionality Tests
- [ ] Face registration works
- [ ] Face verification works
- [ ] Voice queries return responses
- [ ] Predictions generate risk scores
- [ ] Statistics endpoint accessible

### Integration Tests
- [ ] Node.js backend can call AI server
- [ ] Frontend can trigger AI features
- [ ] Database connection working (if configured)
- [ ] All endpoints responding

### Performance Tests
- [ ] Response times acceptable (<2s)
- [ ] Server handles multiple requests
- [ ] No memory leaks
- [ ] CPU usage reasonable

## 📊 Installation Summary

Total installation time: ~15-30 minutes

**What you should have:**
✅ Python AI server running on port 8000  
✅ All dependencies installed  
✅ Virtual environment configured  
✅ Basic tests passing  
✅ API documentation accessible  
✅ Node.js integration ready  
✅ Optional: Vosk model for voice features  

**Ready to use:**
- Face recognition API
- Voice assistant API
- Prediction API
- Full documentation
- Test suite

## 🚀 Next Steps

1. **Start Development**
   - Integrate AI endpoints into your frontend
   - Test face recognition with real photos
   - Customize voice assistant intents

2. **Train Models**
   - Collect real transaction data
   - Train prediction model with actual data
   - Fine-tune accuracy

3. **Deploy to Production**
   - Set up reverse proxy
   - Configure SSL
   - Set up monitoring
   - Implement backups

## 📞 Need Help?

- **Documentation**: README.md
- **Quick Start**: QUICKSTART.md
- **API Docs**: http://localhost:8000/docs
- **Test Examples**: tests/test_ai_endpoints.py

---

**Installation Complete!** 🎉

Your Smart Bus AI Server is ready to use!
