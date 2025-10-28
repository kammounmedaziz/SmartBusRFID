#!/bin/bash
# Smart Bus AI Server - Startup Script (Linux/Mac)

echo "=== Smart Bus AI Server ==="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
    
    echo "Installing dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Check if Vosk model exists
if [ ! -d "models/vosk/vosk-model-small-en-us-0.15" ]; then
    echo ""
    echo "WARNING: Vosk model not found!"
    echo "Download from: https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
    echo "Extract to: models/vosk/vosk-model-small-en-us-0.15/"
    echo ""
    echo "Press Enter to continue without speech recognition..."
    read
fi

# Start server
echo ""
echo "Starting AI Server on http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python app.py
