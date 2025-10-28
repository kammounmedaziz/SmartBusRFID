"""
Voice Assistant Service
Handles speech recognition (Vosk) and text-to-speech (pyttsx3)
Provides intent matching for common bus-related queries
"""

import json
import base64
import wave
import os
from pathlib import Path
from typing import Dict, Optional, List
import logging
import re

# Vosk for offline speech recognition
try:
    from vosk import Model, KaldiRecognizer
    VOSK_AVAILABLE = True
except ImportError:
    VOSK_AVAILABLE = False
    logging.warning("Vosk not available - speech recognition disabled")

# pyttsx3 for text-to-speech
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    logging.warning("pyttsx3 not available - TTS disabled")

logger = logging.getLogger(__name__)

class VoiceAssistant:
    def __init__(self, vosk_model_path: str = "models/vosk"):
        """
        Initialize voice assistant
        
        Args:
            vosk_model_path: Path to Vosk model directory
        """
        self.vosk_model_path = Path(vosk_model_path)
        self.query_count = 0
        
        # Initialize Vosk model if available
        self.vosk_model = None
        if VOSK_AVAILABLE and self.vosk_model_path.exists():
            try:
                self.vosk_model = Model(str(self.vosk_model_path))
                logger.info("Vosk model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load Vosk model: {str(e)}")
        
        # Initialize TTS engine
        self.tts_engine = None
        if TTS_AVAILABLE:
            try:
                self.tts_engine = pyttsx3.init()
                self.tts_engine.setProperty('rate', 150)  # Speed
                self.tts_engine.setProperty('volume', 0.9)  # Volume
                logger.info("TTS engine initialized")
            except Exception as e:
                logger.error(f"Failed to initialize TTS: {str(e)}")
        
        # Define intent patterns and responses
        self.intent_patterns = self._define_intent_patterns()
        
        logger.info("Voice assistant initialized")
    
    def is_ready(self) -> bool:
        """Check if service is ready"""
        return True  # Text processing always available
    
    def _define_intent_patterns(self) -> Dict[str, Dict]:
        """
        Define intent patterns and responses
        
        Returns:
            Dictionary mapping intents to patterns and responses
        """
        return {
            "check_balance": {
                "patterns": [
                    r"balance",
                    r"how much.*left",
                    r"check.*account",
                    r"remaining.*money"
                ],
                "response": "To check your balance, please scan your RFID card at any validator or check the mobile app."
            },
            "recharge_card": {
                "patterns": [
                    r"recharge",
                    r"top up",
                    r"add.*money",
                    r"reload.*card"
                ],
                "response": "You can recharge your card at any authorized station or through the mobile app using mobile money."
            },
            "bus_schedule": {
                "patterns": [
                    r"schedule",
                    r"when.*bus",
                    r"next.*bus",
                    r"timing"
                ],
                "response": "Buses run from 6 AM to 10 PM daily. Check the app for real-time bus locations and schedules."
            },
            "fare_info": {
                "patterns": [
                    r"how much.*cost",
                    r"price",
                    r"fare",
                    r"ticket.*cost"
                ],
                "response": "Fares vary by distance. Short trips start at 500 RWF. Check the fare calculator in the app."
            },
            "lost_card": {
                "patterns": [
                    r"lost.*card",
                    r"stolen.*card",
                    r"missing.*card",
                    r"block.*card"
                ],
                "response": "Please contact customer service immediately at 0788-XXX-XXX to block your card and request a replacement."
            },
            "card_registration": {
                "patterns": [
                    r"register.*card",
                    r"new.*card",
                    r"get.*card",
                    r"apply.*card"
                ],
                "response": "To register a new card, visit any bus station with your ID and photo. Cards cost 2000 RWF."
            },
            "payment_methods": {
                "patterns": [
                    r"payment.*method",
                    r"how.*pay",
                    r"mobile.*money",
                    r"momo"
                ],
                "response": "We accept MTN Mobile Money, Airtel Money, and cash payments at authorized stations."
            },
            "trip_history": {
                "patterns": [
                    r"trip.*history",
                    r"past.*trips",
                    r"journey.*history",
                    r"travel.*record"
                ],
                "response": "View your trip history in the mobile app under 'My Trips' section."
            },
            "customer_service": {
                "patterns": [
                    r"contact",
                    r"customer.*service",
                    r"support",
                    r"help.*number"
                ],
                "response": "Contact us at 0788-XXX-XXX (24/7) or email support@smartbus.rw"
            },
            "greeting": {
                "patterns": [
                    r"hello",
                    r"hi",
                    r"hey",
                    r"good morning",
                    r"good afternoon"
                ],
                "response": "Hello! How can I assist you with Smart Bus services today?"
            },
            "thanks": {
                "patterns": [
                    r"thank",
                    r"thanks",
                    r"appreciate"
                ],
                "response": "You're welcome! Have a great journey!"
            }
        }
    
    def _match_intent(self, text: str) -> Dict:
        """
        Match user input to an intent
        
        Args:
            text: User input text
            
        Returns:
            Dictionary with intent and confidence
        """
        text_lower = text.lower()
        
        best_match = None
        best_confidence = 0
        
        for intent, data in self.intent_patterns.items():
            for pattern in data["patterns"]:
                if re.search(pattern, text_lower):
                    # Simple confidence based on pattern length
                    confidence = len(pattern) / len(text_lower)
                    confidence = min(confidence, 1.0)
                    
                    if confidence > best_confidence:
                        best_confidence = confidence
                        best_match = intent
        
        if best_match:
            return {
                "intent": best_match,
                "confidence": best_confidence,
                "response": self.intent_patterns[best_match]["response"]
            }
        else:
            return {
                "intent": "unknown",
                "confidence": 0,
                "response": "I'm sorry, I didn't understand that. Please ask about balance, recharge, schedules, or other bus services."
            }
    
    def process_text_query(self, text: str) -> Dict:
        """
        Process text query directly
        
        Args:
            text: User query text
            
        Returns:
            Dictionary with intent and response
        """
        self.query_count += 1
        logger.info(f"Processing text query: {text}")
        
        # Match intent
        result = self._match_intent(text)
        
        # Generate audio response if TTS available
        audio_response = None
        if self.tts_engine:
            try:
                audio_response = self._text_to_speech(result["response"])
            except Exception as e:
                logger.error(f"TTS error: {str(e)}")
        
        return {
            "intent": result["intent"],
            "response": result["response"],
            "confidence": result["confidence"],
            "audio_response": audio_response
        }
    
    def process_audio_query(self, audio_base64: str) -> Dict:
        """
        Process audio query using Vosk speech recognition
        
        Args:
            audio_base64: Base64 encoded WAV audio
            
        Returns:
            Dictionary with transcribed text, intent, and response
        """
        self.query_count += 1
        
        if not VOSK_AVAILABLE or not self.vosk_model:
            return {
                "intent": "error",
                "response": "Speech recognition is not available. Please use text input.",
                "confidence": 0
            }
        
        try:
            # Decode audio
            audio_bytes = base64.b64decode(audio_base64)
            
            # Save temporary WAV file
            temp_audio_path = "temp_audio.wav"
            with open(temp_audio_path, "wb") as f:
                f.write(audio_bytes)
            
            # Recognize speech
            wf = wave.open(temp_audio_path, "rb")
            
            if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() not in [8000, 16000, 32000, 44100, 48000]:
                wf.close()
                os.remove(temp_audio_path)
                raise ValueError("Audio must be WAV format mono PCM")
            
            rec = KaldiRecognizer(self.vosk_model, wf.getframerate())
            rec.SetWords(True)
            
            transcription = ""
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    transcription += result.get("text", "") + " "
            
            # Final result
            final_result = json.loads(rec.FinalResult())
            transcription += final_result.get("text", "")
            transcription = transcription.strip()
            
            wf.close()
            os.remove(temp_audio_path)
            
            logger.info(f"Transcribed: {transcription}")
            
            # Process transcribed text
            if transcription:
                result = self.process_text_query(transcription)
                result["transcription"] = transcription
                return result
            else:
                return {
                    "intent": "unknown",
                    "response": "I couldn't understand the audio. Please try again.",
                    "confidence": 0,
                    "transcription": ""
                }
                
        except Exception as e:
            logger.error(f"Audio processing error: {str(e)}")
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
            return {
                "intent": "error",
                "response": f"Audio processing failed: {str(e)}",
                "confidence": 0
            }
    
    def _text_to_speech(self, text: str) -> Optional[str]:
        """
        Convert text to speech and return as base64
        
        Args:
            text: Text to convert
            
        Returns:
            Base64 encoded audio or None if TTS unavailable
        """
        if not self.tts_engine:
            return None
        
        try:
            # Save to temporary file
            temp_audio = "temp_tts.wav"
            self.tts_engine.save_to_file(text, temp_audio)
            self.tts_engine.runAndWait()
            
            # Read and encode
            with open(temp_audio, "rb") as f:
                audio_bytes = f.read()
            
            os.remove(temp_audio)
            
            return base64.b64encode(audio_bytes).decode('utf-8')
            
        except Exception as e:
            logger.error(f"TTS error: {str(e)}")
            return None
    
    def get_available_commands(self) -> List[Dict]:
        """
        Get list of available voice commands
        
        Returns:
            List of command examples
        """
        commands = []
        for intent, data in self.intent_patterns.items():
            commands.append({
                "intent": intent,
                "example": data["patterns"][0].replace(r"\.", ""),
                "response_preview": data["response"][:80] + "..."
            })
        return commands
    
    def get_query_count(self) -> int:
        """Get total number of queries processed"""
        return self.query_count
