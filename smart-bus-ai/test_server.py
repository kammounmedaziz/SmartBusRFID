"""
Test script for AI Server
Run this to verify the server is working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Health check passed")
            print(f"  Response: {response.json()}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Cannot connect to AI server: {e}")
        print(f"  Make sure server is running: python app.py")
        return False

def test_stats():
    """Test stats endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/ai/stats", timeout=5)
        if response.status_code == 200:
            print("✓ Stats endpoint working")
            print(f"  Response: {response.json()}")
            return True
        else:
            print(f"✗ Stats failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Stats error: {e}")
        return False

def test_face_list():
    """Test face list endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/ai/face/list", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✓ Face list endpoint working")
            print(f"  Registered users: {data.get('count', 0)}")
            return True
        else:
            print(f"✗ Face list failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Face list error: {e}")
        return False

def main():
    print("=" * 50)
    print("AI Server Test")
    print("=" * 50)
    print()
    
    results = []
    results.append(test_health())
    print()
    results.append(test_stats())
    print()
    results.append(test_face_list())
    
    print()
    print("=" * 50)
    if all(results):
        print("✓ All tests passed! AI server is working correctly.")
    else:
        print("✗ Some tests failed. Check the errors above.")
    print("=" * 50)

if __name__ == "__main__":
    main()
