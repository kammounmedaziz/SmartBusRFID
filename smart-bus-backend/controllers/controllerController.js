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

// Test card and get last ticket information
export const testCard = async (req, res) => {
  try {
    const { card_uid } = req.body;
    const controller_id = req.user.id;

    if (!card_uid) {
      return res.status(400).json({ error: 'Card UID required' });
    }

    // Find card
    const card = await Card.findByUid(card_uid);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Get last transaction for this card
    const [transactions] = await db.query(
      'SELECT * FROM transactions WHERE card_id = ? ORDER BY timestamp DESC LIMIT 1',
      [card.id]
    );

    const lastTransaction = transactions[0] || null;

    // Get last ticket purchased/paid by the user using this card
    const [tickets] = await db.query(
      `SELECT t.*, 
              tr.from_city, 
              tr.to_city, 
              tr.departure_time, 
              tr.arrival_time,
              tr.price as trip_price,
              tr.bus_type,
              u.name as validated_by_name
       FROM tickets t 
       LEFT JOIN trips tr ON t.trip_id = tr.id 
       LEFT JOIN users u ON t.validated_by = u.id
       WHERE t.card_uid = ? 
       ORDER BY t.purchase_date DESC 
       LIMIT 1`,
      [card_uid]
    );

    const lastTicket = tickets[0] || null;

    // Get last validation for this card
    const [validations] = await db.query(
      'SELECT tv.*, u.name as controller_name FROM ticket_validations tv LEFT JOIN users u ON tv.controller_id = u.id WHERE tv.card_id = ? ORDER BY tv.validation_time DESC LIMIT 1',
      [card.id]
    );

    const lastValidation = validations[0] || null;

    // Log controller action
    await ControllerLog.log({
      controller_id,
      action_type: 'validation',
      details: JSON.stringify({ action: 'card_test', card_uid, card_id: card.id, found: true })
    });

    res.json({
      success: true,
      card: {
        id: card.id,
        uid: card.uid,
        balance: parseFloat(card.balance),
        status: card.status,
        created_at: card.created_at
      },
      last_transaction: lastTransaction ? {
        id: lastTransaction.id,
        amount: parseFloat(lastTransaction.amount),
        type: lastTransaction.type,
        description: lastTransaction.description,
        created_at: lastTransaction.timestamp
      } : null,
      last_ticket: lastTicket ? {
        id: lastTicket.id,
        ticket_number: lastTicket.ticket_number,
        trip: {
          from_city: lastTicket.from_city,
          to_city: lastTicket.to_city,
          departure_time: lastTicket.departure_time,
          arrival_time: lastTicket.arrival_time,
          price: parseFloat(lastTicket.trip_price || 0),
          bus_type: lastTicket.bus_type
        },
        passenger_name: lastTicket.passenger_name,
        passenger_phone: lastTicket.passenger_phone,
        travel_date: lastTicket.travel_date,
        seat_number: lastTicket.seat_number,
        amount_paid: parseFloat(lastTicket.amount_paid),
        status: lastTicket.status,
        purchase_date: lastTicket.purchase_date,
        validation_time: lastTicket.validation_time,
        validated_by: lastTicket.validated_by_name
      } : null,
      last_validation: lastValidation ? {
        id: lastValidation.id,
        location: lastValidation.location,
        status: lastValidation.status,
        fare_amount: parseFloat(lastValidation.fare_amount),
        controller_name: lastValidation.controller_name,
        created_at: lastValidation.validation_time
      } : null
    });

  } catch (err) {
    console.error('testCard error:', err);
    res.status(500).json({ error: err.message || 'Failed to test card' });
  }
};
