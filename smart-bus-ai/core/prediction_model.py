"""
Prediction Model Service
Predicts RFID card low balance risk using machine learning
Uses scikit-learn for classification/regression
"""

import numpy as np
import pickle
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import json

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("scikit-learn not available - predictions disabled")

logger = logging.getLogger(__name__)

class PredictionModel:
    def __init__(self, model_dir: str = "models/ml"):
        """
        Initialize prediction model service
        
        Args:
            model_dir: Directory to store trained models
        """
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        self.model_path = self.model_dir / "card_risk.pkl"
        self.scaler_path = self.model_dir / "scaler.pkl"
        self.metadata_path = self.model_dir / "model_metadata.json"
        
        self.model = None
        self.scaler = None
        self.metadata = {}
        self.prediction_count = 0
        
        # Load existing model if available
        self._load_model()
        
        # If no model exists, create a default one
        if not self.model and SKLEARN_AVAILABLE:
            self._create_default_model()
        
        logger.info("Prediction model service initialized")
    
    def is_ready(self) -> bool:
        """Check if service is ready"""
        return SKLEARN_AVAILABLE
    
    def is_model_trained(self) -> bool:
        """Check if model is trained"""
        return self.model is not None
    
    def _load_model(self):
        """Load trained model and scaler from disk"""
        try:
            if self.model_path.exists() and self.scaler_path.exists():
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                
                with open(self.scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                
                if self.metadata_path.exists():
                    with open(self.metadata_path, 'r') as f:
                        self.metadata = json.load(f)
                
                logger.info("Loaded existing model from disk")
            else:
                logger.info("No existing model found")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
    
    def _save_model(self):
        """Save model and scaler to disk"""
        try:
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            with open(self.scaler_path, 'wb') as f:
                pickle.dump(self.scaler, f)
            
            with open(self.metadata_path, 'w') as f:
                json.dump(self.metadata, f, indent=2)
            
            logger.info("Model saved to disk")
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
    
    def _create_default_model(self):
        """Create a default model with synthetic data"""
        try:
            logger.info("Creating default model with synthetic data")
            
            # Generate synthetic training data
            np.random.seed(42)
            n_samples = 1000
            
            # Features: balance, avg_daily_spend, days_since_recharge, transaction_count
            X = np.random.rand(n_samples, 4)
            
            # Scale features to realistic ranges
            X[:, 0] = X[:, 0] * 50000  # balance: 0-50,000 RWF
            X[:, 1] = X[:, 1] * 5000   # avg_daily_spend: 0-5,000 RWF
            X[:, 2] = X[:, 2] * 30     # days_since_recharge: 0-30 days
            X[:, 3] = X[:, 3] * 100    # transaction_count: 0-100
            
            # Create labels based on heuristic
            # High risk if: low balance AND (high spending OR long time since recharge)
            y = np.zeros(n_samples)
            for i in range(n_samples):
                balance = X[i, 0]
                avg_spend = X[i, 1]
                days = X[i, 2]
                
                # Risk factors
                low_balance = balance < 10000
                high_spend = avg_spend > 2000
                long_time = days > 15
                very_low_balance = balance < 5000
                
                if very_low_balance or (low_balance and (high_spend or long_time)):
                    y[i] = 1  # High risk
            
            # Train model
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.model.fit(X_scaled, y)
            
            # Calculate metrics
            y_pred = self.model.predict(X_scaled)
            accuracy = accuracy_score(y, y_pred)
            
            self.metadata = {
                "created_at": datetime.now().isoformat(),
                "training_samples": n_samples,
                "accuracy": float(accuracy),
                "features": ["balance", "avg_daily_spend", "days_since_recharge", "transaction_count"],
                "model_type": "RandomForestClassifier"
            }
            
            self._save_model()
            
            logger.info(f"Default model created with accuracy: {accuracy:.2%}")
            
        except Exception as e:
            logger.error(f"Error creating default model: {str(e)}")
    
    def _prepare_features(self, card_data: Dict) -> np.ndarray:
        """
        Extract and prepare features from card data
        
        Args:
            card_data: Dictionary with card information
            
        Returns:
            Feature array
        """
        features = [
            card_data.get("balance", 0),
            card_data.get("avg_daily_spend", 0),
            card_data.get("days_since_recharge", 0),
            card_data.get("transaction_count", 0)
        ]
        return np.array([features])
    
    def predict_low_balance(self, cards: List[Dict]) -> List[Dict]:
        """
        Predict low balance risk for multiple cards
        
        Args:
            cards: List of card data dictionaries
            
        Returns:
            List of predictions with risk scores
        """
        if not SKLEARN_AVAILABLE:
            raise ValueError("scikit-learn not available")
        
        if not self.model:
            raise ValueError("Model not trained")
        
        self.prediction_count += len(cards)
        
        predictions = []
        
        for card in cards:
            try:
                # Prepare features
                features = self._prepare_features(card)
                
                # Scale features
                features_scaled = self.scaler.transform(features)
                
                # Predict
                risk_class = self.model.predict(features_scaled)[0]
                risk_proba = self.model.predict_proba(features_scaled)[0]
                
                # Risk score is probability of high risk class
                risk_score = float(risk_proba[1]) if len(risk_proba) > 1 else float(risk_class)
                
                # Calculate estimated days until empty
                balance = card.get("balance", 0)
                avg_spend = card.get("avg_daily_spend", 1)
                days_left = balance / avg_spend if avg_spend > 0 else 999
                
                # Risk level
                if risk_score > 0.7:
                    risk_level = "high"
                elif risk_score > 0.4:
                    risk_level = "medium"
                else:
                    risk_level = "low"
                
                predictions.append({
                    "card_id": card.get("card_id"),
                    "risk_score": round(risk_score, 3),
                    "risk_level": risk_level,
                    "estimated_days_left": round(days_left, 1),
                    "current_balance": card.get("balance", 0),
                    "should_recharge": risk_score > 0.7 or days_left < 3
                })
                
            except Exception as e:
                logger.error(f"Error predicting for card {card.get('card_id')}: {str(e)}")
                predictions.append({
                    "card_id": card.get("card_id"),
                    "error": str(e),
                    "risk_score": 0,
                    "risk_level": "unknown"
                })
        
        return predictions
    
    def train_model(self, training_data: List[Dict]) -> Dict:
        """
        Train or retrain the model with new data
        
        Args:
            training_data: List of labeled training samples
                Each sample should have features and 'risk_label' (0 or 1)
        
        Returns:
            Dictionary with training metrics
        """
        if not SKLEARN_AVAILABLE:
            raise ValueError("scikit-learn not available")
        
        try:
            logger.info(f"Training model with {len(training_data)} samples")
            
            # Prepare features and labels
            X = []
            y = []
            
            for sample in training_data:
                features = self._prepare_features(sample)[0]
                label = sample.get("risk_label", 0)
                
                X.append(features)
                y.append(label)
            
            X = np.array(X)
            y = np.array(y)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            
            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred, zero_division=0)),
                "recall": float(recall_score(y_test, y_pred, zero_division=0)),
                "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
                "training_samples": len(X_train),
                "test_samples": len(X_test)
            }
            
            # Update metadata
            self.metadata = {
                "trained_at": datetime.now().isoformat(),
                "training_samples": len(training_data),
                "metrics": metrics,
                "features": ["balance", "avg_daily_spend", "days_since_recharge", "transaction_count"],
                "model_type": "RandomForestClassifier"
            }
            
            # Save model
            self._save_model()
            
            logger.info(f"Model trained successfully - Accuracy: {metrics['accuracy']:.2%}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict:
        """
        Get information about the current model
        
        Returns:
            Dictionary with model metadata
        """
        return {
            "is_trained": self.model is not None,
            "metadata": self.metadata,
            "model_path": str(self.model_path),
            "scaler_path": str(self.scaler_path),
            "predictions_made": self.prediction_count
        }
    
    def get_prediction_count(self) -> int:
        """Get total number of predictions made"""
        return self.prediction_count
