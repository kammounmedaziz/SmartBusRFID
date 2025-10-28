"""
Smart Bus AI Server - Face Authentication API
FastAPI server for face recognition integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import uvicorn
import os
import pickle
import numpy as np
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import DeepFace
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger.info("DeepFace loaded successfully")
except ImportError:
    DEEPFACE_AVAILABLE = False
    logger.warning("DeepFace not available - install with: pip install deepface")

# Initialize FastAPI
app = FastAPI(
    title="Smart Bus AI Server",
    description="Face recognition and AI services for Smart Bus RFID system",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database file for face embeddings
DB_FILE = "face_db.pkl"

# Pydantic models
class FaceRegisterRequest(BaseModel):
    user_id: int
    image: str  # base64 encoded image
    name: Optional[str] = None

class FaceVerifyRequest(BaseModel):
    image: str  # base64 encoded image

class VoiceQueryRequest(BaseModel):
    text: Optional[str] = None
    audio: Optional[str] = None  # base64 encoded audio

# ==================== DATABASE FUNCTIONS ====================

def load_db() -> Dict:
    """Load face database from pickle file"""
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "rb") as f:
                return pickle.load(f)
        except Exception as e:
            logger.error(f"Error loading database: {e}")
            return {}
    return {}

def save_db(db: Dict):
    """Save face database to pickle file"""
    try:
        with open(DB_FILE, "wb") as f:
            pickle.dump(db, f)
        logger.info("Database saved successfully")
    except Exception as e:
        logger.error(f"Error saving database: {e}")
        raise

def verify_face_match(embedding: List[float], stored_embeddings: List[List[float]], threshold: float = 0.7) -> float:
    """
    Compare face embedding with stored embeddings
    Returns similarity score (0.0 - 1.0)
    """
    if not stored_embeddings:
        return 0.0
    
    similarities = []
    for stored_emb in stored_embeddings:
        # Cosine similarity
        dot_product = np.dot(embedding, stored_emb)
        norm_a = np.linalg.norm(embedding)
        norm_b = np.linalg.norm(stored_emb)
        
        if norm_a == 0 or norm_b == 0:
            similarities.append(0.0)
        else:
            similarity = dot_product / (norm_a * norm_b)
            similarities.append(similarity)
    
    return np.mean(similarities)

# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Smart Bus AI Server",
        "deepface_available": DEEPFACE_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    }

# ==================== FACE RECOGNITION ENDPOINTS ====================

@app.post("/ai/face/register")
async def register_face(request: FaceRegisterRequest):
    """
    Register a new face for a user
    """
    if not DEEPFACE_AVAILABLE:
        raise HTTPException(status_code=500, detail="DeepFace not available")
    
    try:
        user_id = request.user_id
        image_base64 = request.image
        name = request.name or f"user_{user_id}"
        
        logger.info(f"Registering face for user_id: {user_id}")
        
        # Decode base64 image
        import base64
        import cv2
        
        # Remove data URL prefix if present
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
        
        # Decode base64 to image
        image_bytes = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Generate face embedding using DeepFace
        try:
            result = DeepFace.represent(
                img_path=image,
                model_name="Facenet",
                enforce_detection=False
            )
            embedding = result[0]["embedding"]
        except Exception as e:
            logger.error(f"DeepFace error: {e}")
            raise HTTPException(status_code=400, detail=f"Face detection failed: {str(e)}")
        
        # Load database
        db = load_db()
        
        # Store embedding (allow multiple embeddings per user for better accuracy)
        if user_id not in db:
            db[user_id] = {
                "name": name,
                "embeddings": [],
                "created_at": datetime.now().isoformat()
            }
        
        db[user_id]["embeddings"].append(embedding)
        db[user_id]["updated_at"] = datetime.now().isoformat()
        
        # Save database
        save_db(db)
        
        logger.info(f"Face registered successfully for user {user_id}")
        
        return {
            "success": True,
            "message": "Face registered successfully",
            "user_id": user_id,
            "name": name,
            "embeddings_count": len(db[user_id]["embeddings"])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/face/verify")
async def verify_face(request: FaceVerifyRequest):
    """
    Verify a face against registered users
    """
    if not DEEPFACE_AVAILABLE:
        raise HTTPException(status_code=500, detail="DeepFace not available")
    
    try:
        image_base64 = request.image
        
        logger.info("Verifying face...")
        
        # Decode base64 image
        import base64
        import cv2
        
        # Remove data URL prefix if present
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
        
        # Decode base64 to image
        image_bytes = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Generate face embedding
        try:
            result = DeepFace.represent(
                img_path=image,
                model_name="Facenet",
                enforce_detection=False
            )
            embedding = result[0]["embedding"]
        except Exception as e:
            logger.error(f"DeepFace error: {e}")
            raise HTTPException(status_code=400, detail=f"Face detection failed: {str(e)}")
        
        # Load database
        db = load_db()
        
        if not db:
            return {
                "matched": False,
                "message": "No users registered",
                "user_id": None,
                "confidence": 0.0
            }
        
        # Find best match
        best_match_user_id = None
        best_score = 0.0
        threshold = 0.5  # Lowered from 0.7 for better matching (50% similarity required)
        
        for user_id, user_data in db.items():
            score = verify_face_match(embedding, user_data["embeddings"], threshold)
            if score > best_score:
                best_score = score
                best_match_user_id = user_id
        
        # Check if score exceeds threshold
        if best_score >= threshold:
            logger.info(f"Face matched: user_id={best_match_user_id}, confidence={best_score:.2f}")
            return {
                "matched": True,
                "user_id": best_match_user_id,
                "confidence": round(best_score, 3),
                "name": db[best_match_user_id].get("name", "Unknown")
            }
        else:
            logger.info(f"No match found. Best score: {best_score:.2f}")
            return {
                "matched": False,
                "message": "No matching face found",
                "user_id": None,
                "confidence": round(best_score, 3)
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/ai/face/delete/{user_id}")
async def delete_face(user_id: int):
    """
    Delete a registered face
    """
    try:
        db = load_db()
        
        if user_id in db:
            del db[user_id]
            save_db(db)
            logger.info(f"Face deleted for user_id: {user_id}")
            return {
                "success": True,
                "message": f"Face deleted for user {user_id}"
            }
        else:
            raise HTTPException(status_code=404, detail="User not found in face database")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deletion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/face/list")
async def list_faces():
    """
    Get list of registered users
    """
    try:
        db = load_db()
        
        users = []
        for user_id, user_data in db.items():
            users.append({
                "user_id": user_id,
                "name": user_data.get("name", "Unknown"),
                "embeddings_count": len(user_data.get("embeddings", [])),
                "created_at": user_data.get("created_at"),
                "updated_at": user_data.get("updated_at")
            })
        
        return {
            "users": users,
            "count": len(users)
        }
        
    except Exception as e:
        logger.error(f"List error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== VOICE ASSISTANT (Placeholder) ====================

@app.post("/ai/voice/query")
async def voice_query(request: VoiceQueryRequest):
    """
    Process voice/text query
    Placeholder - returns simple responses
    """
    if request.text:
        query = request.text.lower()
        
        # Simple pattern matching
        if any(word in query for word in ["balance", "money", "left"]):
            response = "To check your balance, scan your RFID card at any validator or check the mobile app."
        elif any(word in query for word in ["recharge", "top up", "reload"]):
            response = "You can recharge your card at any authorized station or through the mobile app using mobile money."
        elif any(word in query for word in ["schedule", "when", "timing"]):
            response = "Buses run from 6 AM to 10 PM daily. Check the app for real-time schedules."
        elif any(word in query for word in ["fare", "price", "cost"]):
            response = "Fares vary by distance. Short trips start at 500 RWF. Check the app for details."
        elif any(word in query for word in ["hello", "hi", "hey"]):
            response = "Hello! How can I assist you with Smart Bus services today?"
        else:
            response = "I'm here to help with Smart Bus services. Ask about balance, recharge, schedules, or fares."
        
        return {
            "intent": "general_inquiry",
            "response": response,
            "confidence": 0.8,
            "method": "Pattern matching"
        }
    
    return {
        "intent": "unknown",
        "response": "Please provide a text query.",
        "confidence": 0.0
    }

@app.get("/ai/voice/commands")
async def get_voice_commands():
    """Get available voice commands"""
    return {
        "commands": [
            {"intent": "check_balance", "example": "What is my balance?"},
            {"intent": "recharge", "example": "How do I recharge my card?"},
            {"intent": "schedule", "example": "When does the next bus arrive?"},
            {"intent": "fare_info", "example": "How much does it cost?"},
            {"intent": "greeting", "example": "Hello"}
        ]
    }

# ==================== PREDICTIONS (Placeholder) ====================

@app.post("/ai/predict/low-balance")
async def predict_low_balance(cards: List[Dict]):
    """
    Predict low balance risk
    Placeholder - uses simple heuristics
    """
    predictions = []
    
    for card in cards:
        balance = card.get("balance", 0)
        avg_spend = card.get("avg_daily_spend", 0)
        
        if avg_spend > 0:
            days_left = balance / avg_spend
        else:
            days_left = 999
        
        if days_left < 3 or balance < 2000:
            risk_level = "high"
            risk_score = 0.9
        elif days_left < 7 or balance < 5000:
            risk_level = "medium"
            risk_score = 0.6
        else:
            risk_level = "low"
            risk_score = 0.3
        
        predictions.append({
            "card_id": card.get("card_id"),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "estimated_days_left": round(days_left, 1),
            "current_balance": balance,
            "should_recharge": risk_level == "high",
            "reasoning": f"Balance: {balance} RWF, Daily spend: {avg_spend} RWF"
        })
    
    return {
        "predictions": predictions,
        "summary": {
            "high_risk": sum(1 for p in predictions if p["risk_level"] == "high"),
            "medium_risk": sum(1 for p in predictions if p["risk_level"] == "medium"),
            "low_risk": sum(1 for p in predictions if p["risk_level"] == "low")
        }
    }

@app.get("/ai/stats")
async def get_stats():
    """Get AI service statistics"""
    db = load_db()
    
    return {
        "statistics": {
            "registered_users": len(db),
            "deepface_available": DEEPFACE_AVAILABLE,
            "server_uptime": "active",
            "database_file": DB_FILE,
            "timestamp": datetime.now().isoformat()
        }
    }

# ==================== MAIN ====================

if __name__ == "__main__":
    logger.info("Starting Smart Bus AI Server...")
    logger.info(f"DeepFace available: {DEEPFACE_AVAILABLE}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
