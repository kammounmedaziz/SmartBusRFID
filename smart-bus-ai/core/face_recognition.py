"""
Face Recognition Service
Handles face registration, verification, and embedding storage
Uses face_recognition library (dlib-based)
"""

import face_recognition
import numpy as np
import base64
import cv2
import os
from pathlib import Path
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    def __init__(self, models_dir: str = "models/faces", tolerance: float = 0.6):
        """
        Initialize face recognition service
        
        Args:
            models_dir: Directory to store face embeddings
            tolerance: Matching threshold (lower = stricter)
        """
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.tolerance = tolerance
        self.verification_count = 0
        
        logger.info(f"Face recognition service initialized (tolerance={tolerance})")
        
    def is_ready(self) -> bool:
        """Check if service is ready"""
        return self.models_dir.exists()
    
    def _decode_base64_image(self, image_base64: str) -> np.ndarray:
        """
        Decode base64 image to numpy array
        
        Args:
            image_base64: Base64 encoded image string
            
        Returns:
            Numpy array in RGB format
        """
        try:
            # Remove data URL prefix if present
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_base64)
            nparr = np.frombuffer(image_bytes, np.uint8)
            
            # Decode image
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Failed to decode image")
            
            # Convert BGR to RGB (face_recognition uses RGB)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            return image_rgb
            
        except Exception as e:
            logger.error(f"Error decoding image: {str(e)}")
            raise ValueError(f"Invalid image data: {str(e)}")
    
    def _get_embedding_path(self, user_id: int) -> Path:
        """Get the file path for a user's face embedding"""
        return self.models_dir / f"{user_id}.npy"
    
    def register_face(self, user_id: int, image_base64: str, name: Optional[str] = None) -> Dict:
        """
        Register a new face for a user
        
        Args:
            user_id: User ID from database
            image_base64: Base64 encoded face image
            name: Optional user name for logging
            
        Returns:
            Dictionary with registration result
            
        Raises:
            ValueError: If no face detected or invalid image
        """
        try:
            # Decode image
            image = self._decode_base64_image(image_base64)
            
            # Detect face locations
            face_locations = face_recognition.face_locations(image)
            
            if len(face_locations) == 0:
                raise ValueError("No face detected in image")
            
            if len(face_locations) > 1:
                logger.warning(f"Multiple faces detected, using first face")
            
            # Get face encoding (128-dimensional embedding)
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if len(face_encodings) == 0:
                raise ValueError("Could not generate face encoding")
            
            face_encoding = face_encodings[0]
            
            # Save embedding
            embedding_path = self._get_embedding_path(user_id)
            np.save(embedding_path, face_encoding)
            
            logger.info(f"Face registered: user_id={user_id}, name={name}, path={embedding_path}")
            
            return {
                "user_id": user_id,
                "embedding_shape": face_encoding.shape,
                "face_location": face_locations[0],
                "file_path": str(embedding_path)
            }
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error registering face: {str(e)}")
            raise ValueError(f"Face registration failed: {str(e)}")
    
    def verify_face(self, image_base64: str) -> Dict:
        """
        Verify a face against all registered users
        
        Args:
            image_base64: Base64 encoded face image
            
        Returns:
            Dictionary with verification result:
            - matched: bool
            - user_id: int (if matched)
            - confidence: float (similarity score)
            
        Raises:
            ValueError: If no face detected or invalid image
        """
        try:
            self.verification_count += 1
            
            # Decode image
            image = self._decode_base64_image(image_base64)
            
            # Detect face
            face_locations = face_recognition.face_locations(image)
            
            if len(face_locations) == 0:
                raise ValueError("No face detected in image")
            
            if len(face_locations) > 1:
                logger.warning(f"Multiple faces detected, using first face")
            
            # Get face encoding
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if len(face_encodings) == 0:
                raise ValueError("Could not generate face encoding")
            
            unknown_encoding = face_encodings[0]
            
            # Load all registered embeddings
            registered_users = self.list_registered_users()
            
            if not registered_users:
                logger.info("No registered users found")
                return {"matched": False}
            
            best_match_user = None
            best_match_distance = float('inf')
            
            for user_id in registered_users:
                embedding_path = self._get_embedding_path(user_id)
                known_encoding = np.load(embedding_path)
                
                # Calculate face distance (lower = more similar)
                distance = face_recognition.face_distance([known_encoding], unknown_encoding)[0]
                
                if distance < best_match_distance:
                    best_match_distance = distance
                    best_match_user = user_id
            
            # Check if best match is within tolerance
            matched = best_match_distance <= self.tolerance
            confidence = 1 - best_match_distance  # Convert distance to confidence score
            
            if matched:
                logger.info(f"Face matched: user_id={best_match_user}, confidence={confidence:.2%}")
                return {
                    "matched": True,
                    "user_id": best_match_user,
                    "confidence": float(confidence),
                    "distance": float(best_match_distance)
                }
            else:
                logger.info(f"No match found (best distance={best_match_distance:.3f}, tolerance={self.tolerance})")
                return {
                    "matched": False,
                    "best_distance": float(best_match_distance)
                }
                
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error verifying face: {str(e)}")
            raise ValueError(f"Face verification failed: {str(e)}")
    
    def delete_face(self, user_id: int) -> bool:
        """
        Delete a registered face
        
        Args:
            user_id: User ID
            
        Returns:
            True if deleted successfully
        """
        try:
            embedding_path = self._get_embedding_path(user_id)
            
            if embedding_path.exists():
                embedding_path.unlink()
                logger.info(f"Deleted face embedding for user_id={user_id}")
                return True
            else:
                logger.warning(f"No face embedding found for user_id={user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting face: {str(e)}")
            raise
    
    def list_registered_users(self) -> List[int]:
        """
        Get list of all registered user IDs
        
        Returns:
            List of user IDs
        """
        try:
            user_ids = []
            
            for file_path in self.models_dir.glob("*.npy"):
                try:
                    user_id = int(file_path.stem)
                    user_ids.append(user_id)
                except ValueError:
                    logger.warning(f"Invalid embedding file: {file_path.name}")
            
            return sorted(user_ids)
            
        except Exception as e:
            logger.error(f"Error listing users: {str(e)}")
            return []
    
    def get_verification_count(self) -> int:
        """Get total number of verifications performed"""
        return self.verification_count
    
    def update_tolerance(self, tolerance: float):
        """Update matching tolerance"""
        self.tolerance = tolerance
        logger.info(f"Face recognition tolerance updated to {tolerance}")
