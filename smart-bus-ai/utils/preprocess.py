"""
Image preprocessing utilities
Handles base64 encoding/decoding, resizing, normalization
"""

import cv2
import numpy as np
import base64
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

def decode_base64_image(image_base64: str) -> np.ndarray:
    """
    Decode base64 string to image array
    
    Args:
        image_base64: Base64 encoded image
        
    Returns:
        Numpy array (BGR format)
    """
    try:
        # Remove data URL prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Decode
        image_bytes = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
        
        return image
        
    except Exception as e:
        logger.error(f"Error decoding image: {str(e)}")
        raise

def encode_image_base64(image: np.ndarray, format: str = '.jpg') -> str:
    """
    Encode image array to base64
    
    Args:
        image: Numpy array
        format: Image format (.jpg, .png)
        
    Returns:
        Base64 encoded string
    """
    try:
        _, buffer = cv2.imencode(format, image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        return image_base64
        
    except Exception as e:
        logger.error(f"Error encoding image: {str(e)}")
        raise

def resize_image(image: np.ndarray, size: Tuple[int, int]) -> np.ndarray:
    """
    Resize image to specified dimensions
    
    Args:
        image: Input image
        size: Target size (width, height)
        
    Returns:
        Resized image
    """
    return cv2.resize(image, size, interpolation=cv2.INTER_AREA)

def normalize_image(image: np.ndarray) -> np.ndarray:
    """
    Normalize image to [0, 1] range
    
    Args:
        image: Input image
        
    Returns:
        Normalized image
    """
    return image.astype(np.float32) / 255.0

def bgr_to_rgb(image: np.ndarray) -> np.ndarray:
    """Convert BGR to RGB"""
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

def rgb_to_bgr(image: np.ndarray) -> np.ndarray:
    """Convert RGB to BGR"""
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

def crop_center(image: np.ndarray, crop_size: Tuple[int, int]) -> np.ndarray:
    """
    Crop center of image
    
    Args:
        image: Input image
        crop_size: Crop dimensions (width, height)
        
    Returns:
        Cropped image
    """
    h, w = image.shape[:2]
    crop_w, crop_h = crop_size
    
    start_x = (w - crop_w) // 2
    start_y = (h - crop_h) // 2
    
    return image[start_y:start_y+crop_h, start_x:start_x+crop_w]

def enhance_contrast(image: np.ndarray) -> np.ndarray:
    """
    Enhance image contrast using CLAHE
    
    Args:
        image: Input image
        
    Returns:
        Enhanced image
    """
    # Convert to LAB color space
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # Apply CLAHE to L channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    # Merge and convert back
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    return enhanced

def validate_image(image: np.ndarray, min_size: Tuple[int, int] = (50, 50)) -> bool:
    """
    Validate image dimensions
    
    Args:
        image: Input image
        min_size: Minimum required size (width, height)
        
    Returns:
        True if valid
    """
    if image is None:
        return False
    
    h, w = image.shape[:2]
    min_w, min_h = min_size
    
    return w >= min_w and h >= min_h
