import TicketValidation from "../models/ticketValidationModel.js";
import Card from "../models/cardModel.js";
import Transaction from "../models/transactionModel.js";
import ControllerLog from "../models/controllerLogModel.js";
import db from "../config/db.js";

// Controller validates a ticket
export const validateTicket = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { card_uid, location, fare_amount } = req.body;
    const controller_id = req.user.id;

    if (!card_uid || !fare_amount) {
      return res.status(400).json({ error: 'Card UID and fare amount required' });
    }

    await connection.beginTransaction();

    // Find card
    const card = await Card.findByUid(card_uid);
    if (!card) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check balance
    const balance = parseFloat(card.balance);
    const fare = parseFloat(fare_amount);
    let status = 'valid';
    
    if (balance < fare) {
      status = 'insufficient_balance';
      // Log validation but don't deduct
      await TicketValidation.create({
        card_id: card.id,
        controller_id,
        location: location || 'Unknown',
        status,
        fare_amount: fare
      });

      // Log controller action
      await ControllerLog.log({
        controller_id,
        action_type: 'validation',
        details: JSON.stringify({ card_uid, status, reason: 'insufficient_balance' })
      });

      await connection.commit();
      connection.release();
      return res.status(402).json({ 
        error: 'Insufficient balance',
        current_balance: balance,
        required: fare
      });
    }

    // Deduct fare
    const newBalance = balance - fare;
    await connection.query('UPDATE cards SET balance = ? WHERE id = ?', [newBalance, card.id]);

    // Create transaction
    await connection.query(
      'INSERT INTO transactions (card_id, amount, type, description) VALUES (?, ?, ?, ?)',
      [card.id, fare, 'payment', `Ticket validation at ${location || 'Unknown'}`]
    );

    // Log validation
    await TicketValidation.create({
      card_id: card.id,
      controller_id,
      location: location || 'Unknown',
      status,
      fare_amount: fare
    });

    // Log controller action
    await ControllerLog.log({
      controller_id,
      action_type: 'validation',
      details: JSON.stringify({ card_uid, status, fare, location })
    });

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: 'Ticket validated successfully',
      new_balance: newBalance,
      card_uid: card.uid
    });

  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('validateTicket error:', err);
    res.status(500).json({ error: err.message || 'Failed to validate ticket' });
  }
};

// Get controller's validation history
export const getMyValidations = async (req, res) => {
  try {
    const validations = await TicketValidation.getByControllerId(req.user.id);
    res.json({ data: validations });
  } catch (err) {
    console.error('getMyValidations error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch validations' });
  }
};

// Get controller stats
export const getMyStats = async (req, res) => {
  try {
    const stats = await ControllerLog.getControllerStats(req.user.id);
    res.json({ data: stats });
  } catch (err) {
    console.error('getMyStats error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
};

// Log controller action (login, logout, break)
export const logAction = async (req, res) => {
  try {
    const { action_type, details } = req.body;
    if (!action_type) {
      return res.status(400).json({ error: 'Action type required' });
    }

    await ControllerLog.log({
      controller_id: req.user.id,
      action_type,
      details
    });

    res.json({ success: true, message: 'Action logged' });
  } catch (err) {
    console.error('logAction error:', err);
    res.status(500).json({ error: err.message || 'Failed to log action' });
  }
};

// Admin: Get all validations
export const getAllValidations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const validations = await TicketValidation.getRecentValidations(limit);
    res.json({ data: validations });
  } catch (err) {
    console.error('getAllValidations error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch validations' });
  }
};

// Admin: Get all controller logs
export const getAllControllerLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await ControllerLog.getRecent(limit);
    res.json({ data: logs });
  } catch (err) {
    console.error('getAllControllerLogs error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch logs' });
  }
};
