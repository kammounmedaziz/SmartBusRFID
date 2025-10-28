"""
Test AI Endpoints
Pytest test suite for AI server
"""

import pytest
import requests
import base64
import json
from pathlib import Path

# AI server URL
BASE_URL = "http://localhost:8000"

# ==================== FIXTURES ====================

@pytest.fixture
def sample_image_base64():
    """Generate a simple test image in base64"""
    # Create a simple 100x100 black image
    import cv2
    import numpy as np
    
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    return base64.b64encode(buffer).decode('utf-8')

@pytest.fixture
def sample_card_data():
    """Generate sample card data for predictions"""
    return [
        {
            "card_id": 1,
            "balance": 2000.0,
            "avg_daily_spend": 1500.0,
            "days_since_recharge": 20,
            "transaction_count": 45
        },
        {
            "card_id": 2,
            "balance": 15000.0,
            "avg_daily_spend": 800.0,
            "days_since_recharge": 5,
            "transaction_count": 30
        }
    ]

# ==================== HEALTH CHECKS ====================

def test_root_endpoint():
    """Test root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Smart Bus AI Server"
    assert data["status"] == "online"

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data

# ==================== FACE RECOGNITION TESTS ====================

def test_face_registration(sample_image_base64):
    """Test face registration"""
    payload = {
        "user_id": 9999,
        "image": sample_image_base64,
        "name": "Test User"
    }
    
    response = requests.post(f"{BASE_URL}/ai/face/register", json=payload)
    
    # Note: This will fail with real face recognition (no face in black image)
    # This tests the endpoint structure
    assert response.status_code in [200, 400]

def test_face_verification(sample_image_base64):
    """Test face verification"""
    payload = {
        "image": sample_image_base64
    }
    
    response = requests.post(f"{BASE_URL}/ai/face/verify", json=payload)
    
    # Note: Will fail with no face detected
    assert response.status_code in [200, 400]

def test_list_registered_faces():
    """Test listing registered faces"""
    response = requests.get(f"{BASE_URL}/ai/face/list")
    assert response.status_code == 200
    data = response.json()
    assert "users" in data
    assert "count" in data

# ==================== VOICE ASSISTANT TESTS ====================

def test_voice_text_query():
    """Test text voice query"""
    payload = {
        "text": "What is my balance?"
    }
    
    response = requests.post(f"{BASE_URL}/ai/voice/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "intent" in data
    assert "response" in data
    assert data["success"] is True

def test_voice_commands_list():
    """Test getting voice commands"""
    response = requests.get(f"{BASE_URL}/ai/voice/commands")
    assert response.status_code == 200
    data = response.json()
    assert "commands" in data
    assert len(data["commands"]) > 0

def test_multiple_voice_queries():
    """Test multiple voice queries"""
    queries = [
        "How do I recharge my card?",
        "What are the bus schedules?",
        "Thank you"
    ]
    
    for query in queries:
        payload = {"text": query}
        response = requests.post(f"{BASE_URL}/ai/voice/query", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["intent"] != "unknown"

# ==================== PREDICTION TESTS ====================

def test_predict_low_balance(sample_card_data):
    """Test low balance prediction"""
    response = requests.post(f"{BASE_URL}/ai/predict/low-balance", json=sample_card_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "predictions" in data
    assert len(data["predictions"]) == len(sample_card_data)
    
    # Check prediction structure
    prediction = data["predictions"][0]
    assert "card_id" in prediction
    assert "risk_score" in prediction
    assert "risk_level" in prediction
    assert prediction["risk_level"] in ["low", "medium", "high"]

def test_prediction_summary(sample_card_data):
    """Test prediction summary"""
    response = requests.post(f"{BASE_URL}/ai/predict/low-balance", json=sample_card_data)
    assert response.status_code == 200
    data = response.json()
    
    summary = data["summary"]
    assert summary["total_cards"] == len(sample_card_data)
    assert summary["high_risk"] + summary["medium_risk"] + summary["low_risk"] == len(sample_card_data)

def test_model_info():
    """Test getting model info"""
    response = requests.get(f"{BASE_URL}/ai/predict/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_info" in data
    assert data["success"] is True

# ==================== STATISTICS TESTS ====================

def test_get_statistics():
    """Test getting AI statistics"""
    response = requests.get(f"{BASE_URL}/ai/stats")
    assert response.status_code == 200
    data = response.json()
    assert "statistics" in data
    assert "face_recognition" in data["statistics"]
    assert "voice_assistant" in data["statistics"]
    assert "prediction_model" in data["statistics"]

# ==================== ERROR HANDLING TESTS ====================

def test_invalid_endpoint():
    """Test invalid endpoint"""
    response = requests.get(f"{BASE_URL}/invalid/endpoint")
    assert response.status_code == 404

def test_voice_query_no_input():
    """Test voice query with no input"""
    payload = {}
    response = requests.post(f"{BASE_URL}/ai/voice/query", json=payload)
    assert response.status_code == 400

def test_predict_empty_data():
    """Test prediction with empty data"""
    response = requests.post(f"{BASE_URL}/ai/predict/low-balance", json=[])
    assert response.status_code == 200
    data = response.json()
    assert len(data["predictions"]) == 0

# ==================== INTEGRATION TESTS ====================

def test_full_prediction_workflow(sample_card_data):
    """Test complete prediction workflow"""
    # 1. Get model info
    response = requests.get(f"{BASE_URL}/ai/predict/model-info")
    assert response.status_code == 200
    
    # 2. Make predictions
    response = requests.post(f"{BASE_URL}/ai/predict/low-balance", json=sample_card_data)
    assert response.status_code == 200
    predictions = response.json()["predictions"]
    
    # 3. Verify high-risk cards
    high_risk_cards = [p for p in predictions if p["risk_level"] == "high"]
    
    # Card 1 should be high risk (low balance, high spend)
    card1 = next(p for p in predictions if p["card_id"] == 1)
    assert card1["risk_score"] > 0.5  # Should be at higher risk

def test_voice_intent_matching():
    """Test voice intent matching accuracy"""
    test_cases = [
        ("Check my balance", "check_balance"),
        ("How do I recharge?", "recharge_card"),
        ("When is the next bus?", "bus_schedule"),
        ("Hello", "greeting"),
        ("Thank you", "thanks"),
    ]
    
    for query, expected_intent in test_cases:
        payload = {"text": query}
        response = requests.post(f"{BASE_URL}/ai/voice/query", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == expected_intent, f"Expected {expected_intent}, got {data['intent']} for query: {query}"

# ==================== PERFORMANCE TESTS ====================

def test_prediction_response_time(sample_card_data):
    """Test prediction response time"""
    import time
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/ai/predict/low-balance", json=sample_card_data)
    end_time = time.time()
    
    assert response.status_code == 200
    response_time = end_time - start_time
    assert response_time < 2.0, f"Response time too slow: {response_time}s"

def test_voice_query_response_time():
    """Test voice query response time"""
    import time
    
    payload = {"text": "What is my balance?"}
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/ai/voice/query", json=payload)
    end_time = time.time()
    
    assert response.status_code == 200
    response_time = end_time - start_time
    assert response_time < 1.0, f"Response time too slow: {response_time}s"

# ==================== RUN TESTS ====================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
