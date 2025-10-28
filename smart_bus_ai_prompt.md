🚍 SMART BUS RFID – PYTHON AI SERVER INTEGRATION PROMPT

We are extending the Smart Bus RFID platform with a dedicated **AI Server built in Python**.
This server will handle all intelligent tasks: face recognition, voice assistance, and usage prediction.

---

## 🧠 OBJECTIVE
Develop a **Python-based AI microservice** that integrates with the main Node.js backend.
The Python server will:
1. Run locally (no cloud dependencies)
2. Provide RESTful endpoints to the Node.js server
3. Use lightweight models for real-time inference

---

## ⚙️ ARCHITECTURE OVERVIEW

```
RFID PROJECT/
├── smart-bus-backend/       # Node.js (main server)
│   ├── routes/
│   ├── controllers/
│   └── services/
│       └── aiService.js     # Communicates with Python AI server
│
├── smart-bus-frontend/      # React (UI)
│
└── smart-bus-ai/            # 🧠 Python AI microservice
    ├── app.py               # FastAPI main entry
    ├── requirements.txt     # Dependencies
    ├── core/
    │   ├── face_recognition.py
    │   ├── voice_assistant.py
    │   └── prediction_model.py
    ├── models/
    │   ├── faces/           # Stored embeddings
    │   └── ml/              # Trained ML models (.pkl or .h5)
    ├── utils/
    │   ├── preprocess.py
    │   ├── audio_tools.py
    │   └── db_connector.py  # Optional MariaDB connector
    └── tests/
        └── test_ai_endpoints.py
```

---

## 🚀 PYTHON SERVER DETAILS

### FRAMEWORK
- **FastAPI** for lightweight REST API
- **Uvicorn** for async server

Install:
```bash
pip install fastapi uvicorn numpy opencv-python face_recognition vosk tensorflow scikit-learn
```

---

## 1️⃣ FACE RECOGNITION MODULE

**Goal:** Authenticate users by face (via webcam or uploaded image)

**File:** `core/face_recognition.py`

**Model:**
- Use `face_recognition` (dlib-based) for embeddings
- Store each registered user’s encoding in `/models/faces/{user_id}.npy`

**Endpoints (in app.py):**
```python
POST /ai/face/register      # Save new face embedding
POST /ai/face/verify        # Compare incoming image to stored embeddings
```

**Output Example:**
```json
{ "user_id": 12, "match_confidence": 0.87, "status": "verified" }
```

**Node.js Integration (`aiService.js`):**
```js
const axios = require('axios');
export const verifyFace = async (imageBase64) => {
  const res = await axios.post("http://localhost:8000/ai/face/verify", { image: imageBase64 });
  return res.data;
};
```

---

## 2️⃣ VOICE ASSISTANT MODULE

**Goal:** Allow users to interact with the platform by voice commands.

**File:** `core/voice_assistant.py`

**Components:**
- Speech-to-text: `vosk` (local)
- Command understanding: rule-based (intent matching)
- Text-to-speech: `pyttsx3` or `gTTS` (offline mode)

**Example intents:**
```python
commands = {
  "recharge": "You can recharge your card via the operator dashboard.",
  "balance": "Your card balance is currently 12.5 credits.",
  "help": "You can say things like check balance or recharge card."
}
```

**Endpoints:**
```python
POST /ai/voice/query    # Takes audio or text → returns voice + text reply
```

**Example response:**
```json
{ "intent": "balance", "response": "Your card balance is 12.5 credits." }
```

---

## 3️⃣ CARD PREDICTION MODULE

**Goal:** Predict which RFID cards are likely to run out of balance soon.

**File:** `core/prediction_model.py`

**Approach:**
- Train locally using `scikit-learn` or `tensorflow`
- Input features per card:
  - Average daily spend
  - Last recharge amount
  - Days since last recharge
  - Transaction frequency
- Output: risk score (0–1)

**Model Example (Logistic Regression):**
```python
from sklearn.linear_model import LogisticRegression
import joblib

model = LogisticRegression()
model.fit(X_train, y_train)
joblib.dump(model, "models/ml/card_risk.pkl")
```

**Endpoint:**
```python
POST /ai/predict
```

**Response Example:**
```json
[
  { "card_id": 101, "risk_score": 0.84, "status": "high" },
  { "card_id": 102, "risk_score": 0.32, "status": "low" }
]
```

---

## 🌐 COMMUNICATION FLOW (NODE ⇄ PYTHON)

```
[Frontend] → [Node Backend] → [Python AI Server] → [Node Backend] → [Frontend]
```

**Example:**
1. User submits image → Node calls `verifyFace()` from `aiService.js`
2. Node sends Base64 image → Python AI server → returns verified user
3. Node issues JWT → logs in user automatically

---

## 🧩 NODE SIDE (aiService.js)

```js
import axios from "axios";

const AI_SERVER = "http://localhost:8000";

export const verifyFace = async (imageBase64) => {
  const { data } = await axios.post(`${AI_SERVER}/ai/face/verify`, { image: imageBase64 });
  return data;
};

export const queryVoice = async (text) => {
  const { data } = await axios.post(`${AI_SERVER}/ai/voice/query`, { text });
  return data;
};

export const predictLowBalance = async () => {
  const { data } = await axios.get(`${AI_SERVER}/ai/predict`);
  return data;
};
```

---

## 🧠 LOCAL MODELS USED

| Task | Model | Library | File |
|------|--------|----------|------|
| Face Recognition | Dlib CNN | `face_recognition` | `models/faces/*.npy` |
| Voice Assistant | Vosk Small | `vosk` | `models/vosk/` |
| Text-to-Speech | Pyttsx3 | `pyttsx3` | - |
| Prediction | Logistic Regression | `scikit-learn` | `models/ml/card_risk.pkl` |

All models are **lightweight and run fully offline**.

---

## 🔄 INTEGRATION TESTS

In `/smart-bus-ai/tests/test_ai_endpoints.py`:

```python
def test_face_verify(client):
    r = client.post("/ai/face/verify", json={"image": "base64string"})
    assert r.status_code == 200
    assert "status" in r.json()
```

---

## 🧩 RUNNING BOTH SERVERS

**Start AI server:**
```bash
cd smart-bus-ai
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Start Node server:**
```bash
cd smart-bus-backend
npm start
```

Now both communicate locally on:
- Node backend → http://localhost:5000  
- Python AI → http://localhost:8000

---

## ✅ OUTPUT EXPECTATIONS
- Face login → instant verification & JWT login
- Voice assistant → answers common queries offline
- Prediction → dashboard shows “cards at risk” section

This design keeps AI tasks isolated in a Python service while maintaining full offline capability and efficient communication with the Node backend.

