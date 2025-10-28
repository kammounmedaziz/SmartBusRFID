"""
Audio processing utilities
Handles audio file operations, format conversion, and preprocessing
"""

import wave
import base64
import numpy as np
from pathlib import Path
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

def decode_base64_audio(audio_base64: str, output_path: str = "temp_audio.wav") -> str:
    """
    Decode base64 audio and save to file
    
    Args:
        audio_base64: Base64 encoded audio
        output_path: Output file path
        
    Returns:
        Path to saved audio file
    """
    try:
        # Remove data URL prefix if present
        if ',' in audio_base64:
            audio_base64 = audio_base64.split(',')[1]
        
        # Decode
        audio_bytes = base64.b64decode(audio_base64)
        
        # Save
        with open(output_path, 'wb') as f:
            f.write(audio_bytes)
        
        return output_path
        
    except Exception as e:
        logger.error(f"Error decoding audio: {str(e)}")
        raise

def encode_audio_base64(audio_path: str) -> str:
    """
    Encode audio file to base64
    
    Args:
        audio_path: Path to audio file
        
    Returns:
        Base64 encoded string
    """
    try:
        with open(audio_path, 'rb') as f:
            audio_bytes = f.read()
        
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return audio_base64
        
    except Exception as e:
        logger.error(f"Error encoding audio: {str(e)}")
        raise

def validate_wav_format(audio_path: str) -> Tuple[bool, str]:
    """
    Validate WAV file format
    
    Args:
        audio_path: Path to WAV file
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        with wave.open(audio_path, 'rb') as wf:
            channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            framerate = wf.getframerate()
            
            # Check if mono
            if channels != 1:
                return False, f"Audio must be mono (found {channels} channels)"
            
            # Check if 16-bit PCM
            if sample_width != 2:
                return False, f"Audio must be 16-bit PCM (found {sample_width*8}-bit)"
            
            # Check sample rate
            valid_rates = [8000, 16000, 32000, 44100, 48000]
            if framerate not in valid_rates:
                return False, f"Sample rate must be one of {valid_rates} (found {framerate})"
            
            return True, "Valid WAV format"
            
    except Exception as e:
        return False, f"Error reading WAV file: {str(e)}"

def get_audio_duration(audio_path: str) -> float:
    """
    Get audio duration in seconds
    
    Args:
        audio_path: Path to audio file
        
    Returns:
        Duration in seconds
    """
    try:
        with wave.open(audio_path, 'rb') as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration = frames / float(rate)
            return duration
            
    except Exception as e:
        logger.error(f"Error getting audio duration: {str(e)}")
        return 0.0

def read_audio_frames(audio_path: str, chunk_size: int = 4000) -> bytes:
    """
    Read audio frames in chunks
    
    Args:
        audio_path: Path to audio file
        chunk_size: Number of frames per chunk
        
    Yields:
        Audio data chunks
    """
    try:
        with wave.open(audio_path, 'rb') as wf:
            while True:
                data = wf.readframes(chunk_size)
                if len(data) == 0:
                    break
                yield data
                
    except Exception as e:
        logger.error(f"Error reading audio frames: {str(e)}")
        raise

def audio_to_numpy(audio_path: str) -> Tuple[np.ndarray, int]:
    """
    Convert audio file to numpy array
    
    Args:
        audio_path: Path to audio file
        
    Returns:
        Tuple of (audio_data, sample_rate)
    """
    try:
        with wave.open(audio_path, 'rb') as wf:
            sample_rate = wf.getframerate()
            frames = wf.readframes(wf.getnframes())
            
            # Convert to numpy array
            audio_data = np.frombuffer(frames, dtype=np.int16)
            
            return audio_data, sample_rate
            
    except Exception as e:
        logger.error(f"Error converting audio to numpy: {str(e)}")
        raise

def normalize_audio(audio_data: np.ndarray) -> np.ndarray:
    """
    Normalize audio to [-1, 1] range
    
    Args:
        audio_data: Audio samples
        
    Returns:
        Normalized audio
    """
    max_val = np.abs(audio_data).max()
    if max_val > 0:
        return audio_data.astype(np.float32) / max_val
    return audio_data.astype(np.float32)

def detect_silence(audio_data: np.ndarray, threshold: float = 0.01) -> bool:
    """
    Detect if audio is mostly silent
    
    Args:
        audio_data: Audio samples
        threshold: Silence threshold
        
    Returns:
        True if mostly silent
    """
    normalized = normalize_audio(audio_data)
    rms = np.sqrt(np.mean(normalized**2))
    return rms < threshold
