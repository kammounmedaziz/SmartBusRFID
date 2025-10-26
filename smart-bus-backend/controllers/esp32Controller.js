import Card from "../models/cardModel.js";
import Transaction from "../models/transactionModel.js";
import db from "../config/db.js";

/**
 * ESP32 RFID Payment Controller
 * Handles card payments from ESP32/IoT devices
 * 
 * Features:
 * - No authentication required (secured by API key)
 * - Card status validation
 * - Rate limiting (prevents double-charging)
 * - Enhanced responses for IoT
 * - Comprehensive error handling
 */

// Check card info without charging (pre-flight check)
export const checkCardRFID = async (req, res) => {
  try {
    const { uid } = req.params;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        error_code: 'INVALID_REQUEST',
        message: 'Card UID required'
      });
    }
    
    const card = await Card.findByUid(uid);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error_code: 'CARD_NOT_FOUND',
        message: 'Card not found',
        uid: uid
      });
    }
    
    // Get user info
    let userName = 'Unknown';
    if (card.user_id) {
      const [users] = await db.query('SELECT name FROM users WHERE id = ?', [card.user_id]);
      userName = users[0]?.name || 'Unknown';
    }
    
    res.json({
      success: true,
      card: {
        uid: card.uid,
        balance: parseFloat(card.balance),
        status: card.status,
        user_name: userName,
        user_id: card.user_id,
        has_sufficient_balance: parseFloat(card.balance) >= parseFloat(process.env.DEFAULT_FARE || 50)
      }
    });
    
  } catch (err) {
    console.error('checkCardRFID error:', err);
    res.status(500).json({
      success: false,
      error_code: 'SERVER_ERROR',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Process RFID card payment
export const payFareRFID = async (req, res) => {
  try {
    const { uid, fare, device_id, location } = req.body;
    
    // Validation
    if (!uid) {
      return res.status(400).json({
        success: false,
        error_code: 'INVALID_REQUEST',
        message: 'Card UID required',
        required_fields: ['uid', 'fare']
      });
    }
    
    // Use fare from request or default from env
    const fareAmount = fare != null ? parseFloat(fare) : parseFloat(process.env.DEFAULT_FARE || 50);
    
    if (Number.isNaN(fareAmount) || fareAmount <= 0) {
      return res.status(400).json({
        success: false,
        error_code: 'INVALID_FARE',
        message: 'Fare must be a positive number',
        fare_provided: fare
      });
    }

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Lock and get card
      const [rows] = await connection.query(
        'SELECT * FROM cards WHERE uid = ? FOR UPDATE',
        [uid]
      );
      
      if (rows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({
          success: false,
          error_code: 'CARD_NOT_FOUND',
          message: 'Card not found in system',
          uid: uid,
          hint: 'Please register this card first'
        });
      }
      
      const card = rows[0];
      
      // Check card status
      if (card.status !== 'active') {
        await connection.rollback();
        connection.release();
        return res.status(403).json({
          success: false,
          error_code: 'CARD_BLOCKED',
          message: 'Card is blocked or inactive',
          card_uid: uid,
          status: card.status,
          hint: 'Please contact support'
        });
      }
      
      // Rate limiting - prevent double charging
      const cooldownSeconds = parseInt(process.env.PAYMENT_COOLDOWN || 60);
      const [recentTx] = await connection.query(
        `SELECT id, timestamp, amount FROM transactions 
         WHERE card_id = ? AND type = 'payment' 
         AND timestamp > DATE_SUB(NOW(), INTERVAL ? SECOND)
         ORDER BY timestamp DESC LIMIT 1`,
        [card.id, cooldownSeconds]
      );
      
      if (recentTx.length > 0) {
        const secondsAgo = Math.floor((new Date() - new Date(recentTx[0].timestamp)) / 1000);
        const waitSeconds = cooldownSeconds - secondsAgo;
        
        await connection.rollback();
        connection.release();
        return res.status(429).json({
          success: false,
          error_code: 'RATE_LIMITED',
          message: 'Card was charged recently. Please wait.',
          last_charge: recentTx[0].timestamp,
          last_amount: parseFloat(recentTx[0].amount),
          wait_seconds: waitSeconds,
          hint: `Wait ${waitSeconds} seconds before next payment`
        });
      }
      
      // Check balance
      const currentBalance = parseFloat(card.balance);
      if (currentBalance < fareAmount) {
        const shortage = fareAmount - currentBalance;
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          error_code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance',
          card_uid: uid,
          current_balance: currentBalance,
          fare_required: fareAmount,
          shortage: shortage,
          hint: `Please recharge ${shortage.toFixed(2)} T-Pay or more`
        });
      }
      
      // Deduct fare
      const newBalance = currentBalance - fareAmount;
      await connection.query(
        'UPDATE cards SET balance = ? WHERE id = ?',
        [newBalance, card.id]
      );
      
      // Insert transaction with device tracking
      const [txResult] = await connection.query(
        'INSERT INTO transactions (card_id, amount, type, description) VALUES (?, ?, ?, ?)',
        [
          card.id,
          fareAmount,
          'payment',
          device_id ? `ESP32 Payment - Device: ${device_id}${location ? ', Location: ' + location : ''}` : 'ESP32 Payment'
        ]
      );
      
      // Get user info for response
      let userName = 'Unknown';
      if (card.user_id) {
        const [users] = await connection.query(
          'SELECT name FROM users WHERE id = ?',
          [card.user_id]
        );
        userName = users[0]?.name || 'Unknown';
      }
      
      await connection.commit();
      connection.release();
      
      // Log successful payment
      console.log(`✅ ESP32 Payment: ${uid} - ${userName} - ${fareAmount} T-Pay - Device: ${device_id || 'unknown'}`);
      
      // Enhanced response for ESP32
      res.json({
        success: true,
        message: 'Payment successful',
        transaction: {
          id: txResult.insertId,
          card_uid: uid,
          card_holder: userName,
          fare_charged: fareAmount,
          previous_balance: currentBalance,
          new_balance: newBalance,
          timestamp: new Date().toISOString(),
          type: 'payment'
        },
        card: {
          uid: card.uid,
          status: card.status,
          user_id: card.user_id
        },
        device: {
          id: device_id || 'unknown',
          location: location || 'unknown'
        }
      });
      
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
    
  } catch (err) {
    console.error('❌ payFareRFID error:', err);
    res.status(500).json({
      success: false,
      error_code: 'SERVER_ERROR',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get default fare configuration
export const getDefaultFare = async (req, res) => {
  try {
    const defaultFare = parseFloat(process.env.DEFAULT_FARE || 50);
    const cooldown = parseInt(process.env.PAYMENT_COOLDOWN || 60);
    
    res.json({
      success: true,
      config: {
        default_fare: defaultFare,
        currency: 'T-Pay',
        cooldown_seconds: cooldown,
        server_time: new Date().toISOString(),
        api_version: '1.0'
      }
    });
  } catch (err) {
    console.error('getDefaultFare error:', err);
    res.status(500).json({
      success: false,
      error_code: 'SERVER_ERROR',
      message: 'Failed to get configuration'
    });
  }
};

// Health check endpoint for ESP32
export const healthCheck = async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      api_version: '1.0'
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
};

// Get recent transactions for a card (for display/logging)
export const getCardTransactions = async (req, res) => {
  try {
    const { uid } = req.params;
    const limit = parseInt(req.query.limit || 10);
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        error_code: 'INVALID_REQUEST',
        message: 'Card UID required'
      });
    }
    
    const card = await Card.findByUid(uid);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error_code: 'CARD_NOT_FOUND',
        message: 'Card not found'
      });
    }
    
    const [transactions] = await db.query(
      `SELECT id, amount, type, timestamp, description
       FROM transactions
       WHERE card_id = ?
       ORDER BY timestamp DESC
       LIMIT ?`,
      [card.id, limit]
    );
    
    res.json({
      success: true,
      card_uid: uid,
      transactions: transactions.map(tx => ({
        id: tx.id,
        amount: parseFloat(tx.amount),
        type: tx.type,
        timestamp: tx.timestamp,
        description: tx.description
      }))
    });
    
  } catch (err) {
    console.error('getCardTransactions error:', err);
    res.status(500).json({
      success: false,
      error_code: 'SERVER_ERROR',
      message: 'Failed to fetch transactions'
    });
  }
};

export default {
  checkCardRFID,
  payFareRFID,
  getDefaultFare,
  healthCheck,
  getCardTransactions
};
