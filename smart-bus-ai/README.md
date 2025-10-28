# Smart Bus AI Server

Python FastAPI microservice for face recognition, voice assistance, and predictive analytics.

## 🚀 Features

- **Face Recognition**: Register and verify user faces using dlib-based face_recognition
- **Voice Assistant**: Offline speech recognition (Vosk) and text-to-speech (pyttsx3)
- **Predictive Analytics**: ML-based low balance prediction using scikit-learn
- **REST API**: FastAPI endpoints for seamless integration with Node.js backend
- **Offline Operation**: All models run locally without cloud dependencies

## 📋 Prerequisites

- Python 3.8 or higher
- CMake (for dlib installation)
- Visual Studio Build Tools (Windows) or build-essential (Linux)
- Node.js backend running on port 5000

## 🔧 Installation

### 1. Create Virtual Environment

```bash
cd smart-bus-ai
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# Install requirements
pip install -r requirements.txt

# If dlib fails on Windows, try:
pip install dlib-binary

# Or download pre-built wheel from:
# https://github.com/z-mahmud22/Dlib_Windows_Python3.x
```

### 3. Download Vosk Model (for Speech Recognition)

```bash
# Download lightweight English model (39MB)
# https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

# Extract to:
smart-bus-ai/models/vosk/vosk-model-small-en-us-0.15/

# Alternative: Download larger model for better accuracy (1.8GB)
# vosk-model-en-us-0.22
```

### 4. Configure Database Connection (Optional)

Create `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_bus_db
```

## 🏃 Running the Server

### Start AI Server

```bash
# Development mode (auto-reload)
python app.py

# Or using uvicorn directly
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

Server will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## 📚 API Endpoints

### Health Check

```http
GET /health
```

### Face Recognition

```http
POST /ai/face/register
Content-Type: application/json

{
  "user_id": 123,
  "image": "base64_encoded_image",
  "name": "John Doe"
}
```

```http
POST /ai/face/verify
Content-Type: application/json

{
  "image": "base64_encoded_image"
}
```

```http
GET /ai/face/list
DELETE /ai/face/delete/{user_id}
```

### Voice Assistant

```http
POST /ai/voice/query
Content-Type: application/json

{
  "text": "What is my balance?"
}
```

```http
GET /ai/voice/commands
```

### Predictions

```http
POST /ai/predict/low-balance
Content-Type: application/json

[
  {
    "card_id": 1,
    "balance": 5000.0,
    "avg_daily_spend": 1200.0,
    "days_since_recharge": 15,
    "transaction_count": 30
  }
]
```

```http
POST /ai/predict/train
GET /ai/predict/model-info
```

### Statistics

```http
GET /ai/stats
```

## 🧪 Testing

```bash
# Run all tests
pytest tests/test_ai_endpoints.py -v

# Run specific test
pytest tests/test_ai_endpoints.py::test_voice_text_query -v

# Generate coverage report
pytest --cov=core --cov=utils tests/
```

## 🔗 Node.js Integration

The Node.js backend includes `aiService.js` for easy integration:

```javascript
const aiService = require('./services/aiService');

// Verify face
const result = await aiService.verifyFace(imageBase64);
if (result.matched) {
  console.log(`User ${result.userId} verified with ${result.confidence}% confidence`);
}

// Query voice
const response = await aiService.queryVoiceText("How do I recharge?");
console.log(response.response);

// Predict low balance
const predictions = await aiService.predictLowBalance(cardData);
console.log(`${predictions.summary.high_risk} cards at high risk`);
```

## 📁 Project Structure

```
smart-bus-ai/
├── app.py                      # FastAPI application
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables
│
├── core/                       # Core AI modules
│   ├── face_recognition.py     # Face recognition service
│   ├── voice_assistant.py      # Voice assistant service
│   └── prediction_model.py     # ML prediction service
│
├── models/                     # Model storage
│   ├── faces/                  # Face embeddings (.npy)
│   ├── ml/                     # ML models (.pkl)
│   └── vosk/                   # Vosk speech models
│
├── utils/                      # Utility modules
│   ├── preprocess.py           # Image preprocessing
│   ├── audio_tools.py          # Audio utilities
│   └── db_connector.py         # Database connector
│
└── tests/                      # Test suite
    └── test_ai_endpoints.py    # API tests
```

## 🎯 Use Cases

### 1. Face Authentication for Controllers

```javascript
// Controller scans their face
const faceImage = captureImage();
const result = await aiService.verifyFace(faceImage);

if (result.matched) {
  // Allow controller to access validation features
  redirectTo('/controller/dashboard');
}
```

### 2. Voice Assistant for Users

```javascript
// User asks a question
const query = "When is the next bus?";
const response = await aiService.queryVoiceText(query);

// Display response
showMessage(response.response);

// Play audio response if available
if (response.audioResponse) {
  playAudio(response.audioResponse);
}
```

### 3. Automated Low Balance Alerts

```javascript
// Daily cron job
cron.schedule('0 9 * * *', async () => {
  // Get all active cards
  const cards = await getActiveCardsWithStats();
  
  // Predict risks
  const predictions = await aiService.predictLowBalance(cards);
  
  // Send SMS to high-risk users
  predictions.predictions
    .filter(p => p.risk_level === 'high')
    .forEach(async (p) => {
      await sendSMS(p.card_id, `Your balance is low (${p.current_balance} RWF). Please recharge soon.`);
    });
});
```

## ⚙️ Configuration

### Face Recognition Settings

Adjust tolerance in `core/face_recognition.py`:

```python
# Lower = stricter matching (0.4-0.6 recommended)
# Higher = more lenient (0.6-0.8)
FaceRecognitionService(tolerance=0.6)
```

### Voice Assistant Intents

Add custom intents in `core/voice_assistant.py`:

```python
self.intent_patterns = {
    "custom_intent": {
        "patterns": [r"your", r"regex", r"patterns"],
        "response": "Your custom response"
    }
}
```

### Prediction Model

Retrain with real data:

```python
# Collect historical data
training_data = db.get_training_data(days=90)

# Train model
result = prediction_service.train_model(training_data)
print(f"Accuracy: {result['accuracy']:.2%}")
```

## 🐛 Troubleshooting

### dlib Installation Fails

**Windows:**
```bash
pip install dlib-binary
# Or download wheel from: https://github.com/z-mahmud22/Dlib_Windows_Python3.x
```

**Linux:**
```bash
sudo apt-get install cmake build-essential
pip install dlib
```

### Vosk Model Not Found

Download and extract model to `models/vosk/` directory:
```bash
# Download from https://alphacephei.com/vosk/models
# Extract: models/vosk/vosk-model-small-en-us-0.15/
```

### Face Recognition Not Working

- Ensure image is well-lit and face is clearly visible
- Try adjusting tolerance parameter
- Check that face is not too small in image

### Port 8000 Already in Use

```bash
# Use different port
uvicorn app:app --port 8001
```

Then update Node.js backend:
```javascript
AI_SERVER_URL=http://localhost:8001
```

## 📊 Performance

- Face Verification: ~200-500ms
- Voice Query (text): ~50-100ms
- Prediction (100 cards): ~100-200ms
- Model Training: 1-5 seconds (depending on data size)

## 🔒 Security

- All face embeddings stored locally (not in database)
- No cloud API calls - fully offline
- JWT authentication via main backend
- CORS restricted to backend/frontend origins

## 📝 License

MIT License - Smart Bus System

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Support

For issues and questions:
- Email: support@smartbus.rw
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

## 🎉 Acknowledgments

- [face_recognition](https://github.com/ageitgey/face_recognition) by Adam Geitgey
- [Vosk](https://alphacephei.com/vosk/) by Alpha Cephei
- [FastAPI](https://fastapi.tiangolo.com/) by Sebastián Ramírez
- [scikit-learn](https://scikit-learn.org/) by scikit-learn developers
