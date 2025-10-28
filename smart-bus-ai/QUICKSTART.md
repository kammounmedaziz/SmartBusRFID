# 🚀 Quick Start Guide - Smart Bus AI Server

## Installation (5 minutes)

### 1. Navigate to AI folder
```powershell
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-ai"
```

### 2. Run startup script
```powershell
.\start_ai.ps1
```

The script will automatically:
- Create virtual environment
- Install all dependencies
- Start the server

### 3. Verify server is running
Open browser: http://localhost:8000/docs

You should see the interactive API documentation.

## ⚠️ Important: Download Vosk Model

For voice recognition to work, download the speech model:

1. **Download**: https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip (39MB)
2. **Extract** to: `smart-bus-ai\models\vosk\vosk-model-small-en-us-0.15\`

Without this, voice features won't work (but face and predictions will).

## 🧪 Test the API

### Test Face Recognition
```powershell
# In another terminal
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-ai"
.\venv\Scripts\activate
pytest tests/test_ai_endpoints.py::test_root_endpoint -v
```

### Test Voice Assistant
```powershell
pytest tests/test_ai_endpoints.py::test_voice_text_query -v
```

### Test Predictions
```powershell
pytest tests/test_ai_endpoints.py::test_predict_low_balance -v
```

## 🔗 Integrate with Node.js Backend

### 1. Ensure AI server is running
```powershell
# Terminal 1: AI Server
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-ai"
.\start_ai.ps1
```

### 2. Start Node.js backend
```powershell
# Terminal 2: Backend
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-backend"
npm start
```

### 3. Use AI service in your code
```javascript
const aiService = require('./services/aiService');

// Example: Verify face
const result = await aiService.verifyFace(imageBase64);
console.log(result);
```

## 📝 Common Issues

### "dlib failed to install"
**Solution:**
```powershell
pip install dlib-binary
```

### "Vosk model not found"
**Solution:** Download from https://alphacephei.com/vosk/models and extract to `models/vosk/`

### "Port 8000 in use"
**Solution:** Stop other services or change port in `app.py`:
```python
uvicorn.run("app:app", port=8001)
```

## ✅ You're Ready!

AI server is now running at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

Next steps:
- Test face recognition with real photos
- Train prediction model with your data
- Integrate voice commands into frontend

## 📚 Full Documentation

See `README.md` for complete API reference and advanced configuration.
