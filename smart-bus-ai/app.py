"""
Smart Bus AI Server - FastAPI Application
Handles face recognition, voice assistant, and predictive analytics
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import logging
from datetime import datetime

from core.face_recognition import FaceRecognitionService
from core.voice_assistant import VoiceAssistant
from core.prediction_model import PredictionModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Bus AI Server",
    description="AI microservice for face recognition, voice assistance, and predictions",
    version="1.0.0"
)

# CORS middleware for Node.js backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI services
face_service = FaceRecognitionService()
voice_service = VoiceAssistant()
prediction_service = PredictionModel()

# ==================== REQUEST/RESPONSE MODELS ====================

class FaceRegisterRequest(BaseModel):
    user_id: int
    image: str  # Base64 encoded image
    name: Optional[str] = None

class FaceVerifyRequest(BaseModel):
    image: str  # Base64 encoded image

class VoiceQueryRequest(BaseModel):
    text: Optional[str] = None
    audio: Optional[str] = None  # Base64 encoded audio

class PredictionRequest(BaseModel):
    card_ids: Optional[List[int]] = None  # If None, predict for all cards

class CardData(BaseModel):
    card_id: int
    balance: float
    avg_daily_spend: float
    days_since_recharge: int
    transaction_count: int

# ==================== HEALTH CHECK ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Smart Bus AI Server",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "face_recognition": face_service.is_ready(),
            "voice_assistant": voice_service.is_ready(),
            "prediction_model": prediction_service.is_ready()
        },
        "timestamp": datetime.now().isoformat()
    }

# ==================== FACE RECOGNITION ENDPOINTS ====================

@app.post("/ai/face/register")
async def register_face(request: FaceRegisterRequest):
    """
    Register a new face for a user
    
    Args:
        user_id: User ID from main database
        image: Base64 encoded face image
        name: Optional user name for logging
        
    Returns:
        Success status and face embedding info
    """
    try:
        logger.info(f"Registering face for user_id: {request.user_id}")
        
        result = face_service.register_face(
            user_id=request.user_id,
            image_base64=request.image,
            name=request.name
        )
        
        logger.info(f"Face registered successfully for user {request.user_id}")
        return {
            "success": True,
            "user_id": request.user_id,
            "message": "Face registered successfully",
            "embedding_shape": result.get("embedding_shape"),
            "timestamp": datetime.now().isoformat()
        }
        
    except ValueError as e:
        logger.error(f"Face registration error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during face registration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/ai/face/verify")
async def verify_face(request: FaceVerifyRequest):
    """
    Verify a face against registered users
    
    Args:
        image: Base64 encoded face image
        
    Returns:
        Matched user_id and confidence score
    """
    try:
        logger.info("Verifying face")
        
        result = face_service.verify_face(image_base64=request.image)
        
        if result["matched"]:
            logger.info(f"Face matched: user_id={result['user_id']}, confidence={result['confidence']:.2f}")
        else:
            logger.info("No face match found")
            
        return {
            "success": True,
            "matched": result["matched"],
            "user_id": result.get("user_id"),
            "confidence": result.get("confidence"),
            "status": "verified" if result["matched"] else "not_recognized",
            "timestamp": datetime.now().isoformat()
        }
        
    except ValueError as e:
        logger.error(f"Face verification error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during face verification: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/ai/face/delete/{user_id}")
async def delete_face(user_id: int):
    """Delete a registered face"""
    try:
        logger.info(f"Deleting face for user_id: {user_id}")
        
        result = face_service.delete_face(user_id=user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "message": "Face deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error deleting face: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/face/list")
async def list_registered_faces():
    """Get list of all registered user IDs"""
    try:
        users = face_service.list_registered_users()
        return {
            "success": True,
            "count": len(users),
            "users": users,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error listing faces: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== VOICE ASSISTANT ENDPOINTS ====================

@app.post("/ai/voice/query")
async def voice_query(request: VoiceQueryRequest):
    """
    Process voice or text query and return response
    
    Args:
        text: Text query (optional)
        audio: Base64 encoded audio (optional)
        
    Returns:
        Intent, response text, and optional audio response
    """
    try:
        logger.info("Processing voice query")
        
        # Process text or audio
        if request.text:
            result = voice_service.process_text_query(request.text)
        elif request.audio:
            result = voice_service.process_audio_query(request.audio)
        else:
            raise HTTPException(status_code=400, detail="Either text or audio must be provided")
        
        logger.info(f"Voice query processed: intent={result['intent']}")
        
        return {
            "success": True,
            "intent": result["intent"],
            "response": result["response"],
            "audio_response": result.get("audio_response"),  # Optional TTS audio
            "confidence": result.get("confidence", 1.0),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing voice query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/voice/commands")
async def list_voice_commands():
    """Get list of available voice commands"""
    try:
        commands = voice_service.get_available_commands()
        return {
            "success": True,
            "commands": commands,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error listing commands: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PREDICTION ENDPOINTS ====================

@app.post("/ai/predict/low-balance")
async def predict_low_balance(cards: List[CardData]):
    """
    Predict which cards are likely to run out of balance soon
    
    Args:
        cards: List of card data with usage statistics
        
    Returns:
        Risk scores for each card
    """
    try:
        logger.info(f"Predicting low balance for {len(cards)} cards")
        
        predictions = prediction_service.predict_low_balance(
            [card.dict() for card in cards]
        )
        
        high_risk = [p for p in predictions if p["risk_score"] > 0.7]
        logger.info(f"Found {len(high_risk)} high-risk cards")
        
        return {
            "success": True,
            "predictions": predictions,
            "summary": {
                "total_cards": len(predictions),
                "high_risk": len(high_risk),
                "medium_risk": len([p for p in predictions if 0.4 < p["risk_score"] <= 0.7]),
                "low_risk": len([p for p in predictions if p["risk_score"] <= 0.4])
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/predict/train")
async def train_prediction_model(training_data: List[dict]):
    """
    Train or retrain the prediction model with new data
    
    Args:
        training_data: Historical card data with labels
        
    Returns:
        Training metrics
    """
    try:
        logger.info(f"Training model with {len(training_data)} samples")
        
        result = prediction_service.train_model(training_data)
        
        logger.info(f"Model trained - Accuracy: {result['accuracy']:.2%}")
        
        return {
            "success": True,
            "metrics": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/predict/model-info")
async def get_model_info():
    """Get information about the current prediction model"""
    try:
        info = prediction_service.get_model_info()
        return {
            "success": True,
            "model_info": info,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== STATISTICS ENDPOINTS ====================

@app.get("/ai/stats")
async def get_statistics():
    """Get AI service statistics"""
    try:
        stats = {
            "face_recognition": {
                "registered_users": len(face_service.list_registered_users()),
                "total_verifications": face_service.get_verification_count()
            },
            "voice_assistant": {
                "total_queries": voice_service.get_query_count(),
                "available_commands": len(voice_service.get_available_commands())
            },
            "prediction_model": {
                "model_trained": prediction_service.is_model_trained(),
                "total_predictions": prediction_service.get_prediction_count()
            }
        }
        
        return {
            "success": True,
            "statistics": stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== MAIN ====================

if __name__ == "__main__":
    logger.info("Starting Smart Bus AI Server...")
    logger.info("Server will be available at http://localhost:8000")
    logger.info("API documentation at http://localhost:8000/docs")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
