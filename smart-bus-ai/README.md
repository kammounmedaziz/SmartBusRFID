# Smart Bus AI Server

FastAPI server providing face recognition and AI services for the Smart Bus RFID system.

## Features

- **Face Authentication**
  - Register user faces
  - Verify faces for login
  - Delete registered faces
  - Multiple face embeddings per user for better accuracy

- **Voice Assistant** (Basic)
  - Natural language query processing
  - Intent recognition
  - Voice command support

- **Predictive Analytics** (Basic)
  - Low balance predictions
  - Usage pattern analysis

## Installation

### 1. Install Python Dependencies

```powershell
# Using the installation script (recommended)
.\install-dependencies.ps1

# OR manually
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Verify Installation

```powershell
python -c "import deepface; print('DeepFace OK')"
python -c "import cv2; print('OpenCV OK')"
python -c "import tensorflow; print('TensorFlow OK')"
```

## Usage

### Start the Server

```powershell
# Using Python directly
python app.py

# OR using the start script from project root
.\start.ps1
```

The server will start on `http://localhost:8000`

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check
```
GET /health
```

### Face Recognition

#### Register Face
```
POST /ai/face/register
Body: {
  "user_id": 123,
  "image": "base64_encoded_image",
  "name": "John Doe"
}
```

#### Verify Face
```
POST /ai/face/verify
Body: {
  "image": "base64_encoded_image"
}
Response: {
  "matched": true,
  "user_id": 123,
  "confidence": 0.89,
  "name": "John Doe"
}
```

#### Delete Face
```
DELETE /ai/face/delete/{user_id}
```

#### List Registered Faces
```
GET /ai/face/list
```

### Voice Assistant

#### Process Query
```
POST /ai/voice/query
Body: {
  "text": "What is my balance?"
}
```

#### Get Commands
```
GET /ai/voice/commands
```

### Statistics
```
GET /ai/stats
```

## Architecture

### Face Recognition Flow

1. **Registration**:
   - Client captures face image → base64 encode
   - POST to `/ai/face/register` with user_id
   - DeepFace generates face embedding (512-dimensional vector)
   - Embedding stored in pickle database (`face_db.pkl`)

2. **Verification**:
   - Client captures face image → base64 encode
   - POST to `/ai/face/verify`
   - DeepFace generates embedding for input image
   - Compare with all stored embeddings using cosine similarity
   - Return matched user_id if similarity > 0.7

3. **Storage**:
   - Database file: `face_db.pkl`
   - Structure: `{user_id: {name, embeddings[], created_at, updated_at}}`
   - Supports multiple embeddings per user for robustness

### Technology Stack

- **FastAPI**: Modern Python web framework
- **DeepFace**: Face recognition library (uses Facenet model)
- **OpenCV**: Image processing
- **TensorFlow**: Deep learning backend
- **Uvicorn**: ASGI server

## Configuration

### Environment Variables

Create `.env` file:
```env
# Server
HOST=0.0.0.0
PORT=8000

# Face Recognition
FACE_DETECTION_THRESHOLD=0.7
FACE_MODEL=Facenet

# Database
DB_FILE=face_db.pkl

# CORS
CORS_ORIGINS=http://localhost:5000,http://localhost:5173
```

### Face Recognition Settings

- **Model**: Facenet (default) - Good balance of speed and accuracy
- **Threshold**: 0.7 (70% similarity required for match)
- **Enforcement**: `enforce_detection=False` (allows processing even if face unclear)

## Integration with Backend

The Node.js backend (`smart-bus-backend/services/aiService.js`) connects to this server:

```javascript
// Backend calls
await aiService.registerFace(userId, imageBase64, name);
const result = await aiService.verifyFace(imageBase64);
await aiService.deleteFace(userId);
```

## Troubleshooting

### DeepFace Model Download

On first run, DeepFace downloads the Facenet model (~100MB). Wait for completion:
```
Downloading model weights...
Model loaded successfully
```

### TensorFlow Warnings

Ignore TensorFlow optimization warnings (e.g., "AVX2 instructions"). The server works fine.

### Face Detection Fails

- Ensure good lighting
- Face should be clearly visible
- Image quality should be reasonable
- Try multiple registration photos for better accuracy

### Port Already in Use

```powershell
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PID> /F
```

## Database Management

### Backup Face Database
```powershell
Copy-Item face_db.pkl face_db_backup_$(Get-Date -Format 'yyyyMMdd').pkl
```

### Clear Database
```powershell
Remove-Item face_db.pkl
```

### Inspect Database
```python
import pickle
with open('face_db.pkl', 'rb') as f:
    db = pickle.load(f)
    print(f"Registered users: {len(db)}")
    for user_id, data in db.items():
        print(f"User {user_id}: {data['name']}, {len(data['embeddings'])} embeddings")
```

## Performance

- **Registration**: ~2-3 seconds per face
- **Verification**: ~1-2 seconds per verification
- **Model**: Facenet (512D embeddings)
- **Accuracy**: ~95% with good lighting and multiple embeddings

## Future Enhancements

- [ ] MySQL integration instead of pickle database
- [ ] Llama 3.1 integration for voice assistant
- [ ] Advanced predictive analytics
- [ ] Face liveness detection (anti-spoofing)
- [ ] Multiple face model support
- [ ] Batch face processing
- [ ] API authentication/rate limiting

## License

Part of Smart Bus RFID System
