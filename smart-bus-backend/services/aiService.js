/**
 * AI Service Integration
 * Node.js service to communicate with Python AI server
 */

const axios = require('axios');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

class AIService {
  constructor() {
    this.baseURL = AI_SERVER_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check AI server health
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('AI server health check failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== FACE RECOGNITION ====================

  /**
   * Register a new face for a user
   * @param {number} userId - User ID
   * @param {string} imageBase64 - Base64 encoded face image
   * @param {string} name - Optional user name
   */
  async registerFace(userId, imageBase64, name = null) {
    try {
      const response = await this.client.post('/ai/face/register', {
        user_id: userId,
        image: imageBase64,
        name: name,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Face registration failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }

  /**
   * Verify a face against registered users
   * @param {string} imageBase64 - Base64 encoded face image
   */
  async verifyFace(imageBase64) {
    try {
      const response = await this.client.post('/ai/face/verify', {
        image: imageBase64,
      });

      return {
        success: true,
        matched: response.data.matched,
        userId: response.data.user_id,
        confidence: response.data.confidence,
        data: response.data,
      };
    } catch (error) {
      console.error('Face verification failed:', error.response?.data || error.message);
      return {
        success: false,
        matched: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }

  /**
   * Delete a registered face
   * @param {number} userId - User ID
   */
  async deleteFace(userId) {
    try {
      const response = await this.client.delete(`/ai/face/delete/${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Face deletion failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get list of registered users
   */
  async listRegisteredFaces() {
    try {
      const response = await this.client.get('/ai/face/list');
      return {
        success: true,
        users: response.data.users,
        count: response.data.count,
      };
    } catch (error) {
      console.error('Failed to list faces:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== VOICE ASSISTANT ====================

  /**
   * Process text query
   * @param {string} text - User query text
   */
  async queryVoiceText(text) {
    try {
      const response = await this.client.post('/ai/voice/query', {
        text: text,
      });

      return {
        success: true,
        intent: response.data.intent,
        response: response.data.response,
        audioResponse: response.data.audio_response,
        confidence: response.data.confidence,
      };
    } catch (error) {
      console.error('Voice query failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }

  /**
   * Process audio query
   * @param {string} audioBase64 - Base64 encoded audio
   */
  async queryVoiceAudio(audioBase64) {
    try {
      const response = await this.client.post('/ai/voice/query', {
        audio: audioBase64,
      });

      return {
        success: true,
        intent: response.data.intent,
        response: response.data.response,
        transcription: response.data.transcription,
        audioResponse: response.data.audio_response,
        confidence: response.data.confidence,
      };
    } catch (error) {
      console.error('Voice query failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }

  /**
   * Get available voice commands
   */
  async getVoiceCommands() {
    try {
      const response = await this.client.get('/ai/voice/commands');
      return {
        success: true,
        commands: response.data.commands,
      };
    } catch (error) {
      console.error('Failed to get commands:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== PREDICTIONS ====================

  /**
   * Predict low balance risk for cards
   * @param {Array} cards - Array of card data objects
   */
  async predictLowBalance(cards) {
    try {
      const response = await this.client.post('/ai/predict/low-balance', cards);

      return {
        success: true,
        predictions: response.data.predictions,
        summary: response.data.summary,
      };
    } catch (error) {
      console.error('Prediction failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }

  /**
   * Train prediction model with new data
   * @param {Array} trainingData - Array of labeled training samples
   */
  async trainPredictionModel(trainingData) {
    try {
      const response = await this.client.post('/ai/predict/train', trainingData);

      return {
        success: true,
        metrics: response.data.metrics,
      };
    } catch (error) {
      console.error('Model training failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
      };
    }
  }

  /**
   * Get model information
   */
  async getModelInfo() {
    try {
      const response = await this.client.get('/ai/predict/model-info');
      return {
        success: true,
        modelInfo: response.data.model_info,
      };
    } catch (error) {
      console.error('Failed to get model info:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get AI service statistics
   */
  async getStatistics() {
    try {
      const response = await this.client.get('/ai/stats');
      return {
        success: true,
        statistics: response.data.statistics,
      };
    } catch (error) {
      console.error('Failed to get statistics:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
module.exports = new AIService();
