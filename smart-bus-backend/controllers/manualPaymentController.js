import ManualPayment from "../models/manualPaymentModel.js";
import db from "../config/db.js";

// Create manual payment request
export const createManualPayment = async (req, res) => {
  try {
    const { amount, payment_method, card_id, operator_name, notes } = req.body;
    const user_id = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    if (!payment_method || !['cash', 'card'].includes(payment_method)) {
      return res.status(400).json({ error: 'Payment method must be cash or card' });
    }

    // If payment method is cash, operator_name is required
    if (payment_method === 'cash' && !operator_name) {
      return res.status(400).json({ error: 'Operator name required for cash payments' });
    }

    // If payment method is card, card_id is required
    if (payment_method === 'card' && !card_id) {
      return res.status(400).json({ error: 'Card ID required for card payments' });
    }

    // If payment method is card, verify the card belongs to the user and has sufficient balance
    if (payment_method === 'card') {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        const [cards] = await connection.query(
          'SELECT * FROM cards WHERE id = ? AND user_id = ? FOR UPDATE',
          [card_id, user_id]
        );
        
        if (cards.length === 0) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ error: 'Card not found or does not belong to you' });
        }

        const card = cards[0];
        if (parseFloat(card.balance) < parseFloat(amount)) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: 'Insufficient balance on selected card' });
        }

        // Deduct amount from card balance
        const newBalance = parseFloat(card.balance) - parseFloat(amount);
        await connection.query(
          'UPDATE cards SET balance = ? WHERE id = ?',
          [newBalance, card_id]
        );

        // Create transaction record
        await connection.query(
          'INSERT INTO transactions (card_id, amount, type, status) VALUES (?, ?, ?, ?)',
          [card_id, amount, 'payment', 'completed']
        );

        // Create manual payment record with verified status
        const [result] = await connection.query(
          'INSERT INTO manual_payments (user_id, amount, payment_method, card_id, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [user_id, amount, payment_method, card_id, 'verified', notes]
        );

        await connection.commit();
        connection.release();

        return res.status(201).json({
          success: true,
          message: 'Card payment completed successfully.',
          id: result.insertId,
          new_balance: newBalance
        });
      } catch (err) {
        await connection.rollback();
        connection.release();
        throw err;
      }
    }

    // For cash payments, save operator_name and keep status as pending
    const id = await ManualPayment.create({
      user_id,
      amount,
      payment_method,
      card_id: null,
      operator_name,
      notes
    });

    res.status(201).json({
      success: true,
      message: `Cash payment request submitted. Operator: ${operator_name}. Waiting for verification.`,
      id
    });
  } catch (err) {
    console.error('createManualPayment error:', err);
    res.status(500).json({ error: err.message || 'Failed to create payment request' });
  }
};

// Get user's manual payment history
export const getMyPayments = async (req, res) => {
  try {
    const payments = await ManualPayment.getByUserId(req.user.id);
    res.json({ data: payments });
  } catch (err) {
    console.error('getMyPayments error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch payments' });
  }
};

// Admin: Get all manual payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await ManualPayment.getAll();
    res.json({ data: payments });
  } catch (err) {
    console.error('getAllPayments error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch payments' });
  }
};

// Admin: Get pending payments
export const getPendingPayments = async (req, res) => {
  try {
    const payments = await ManualPayment.getPending();
    res.json({ data: payments });
  } catch (err) {
    console.error('getPendingPayments error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch pending payments' });
  }
};

// Admin: Verify/reject payment
export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be verified or rejected' });
    }

    await ManualPayment.updateStatus(id, status, req.user.id);

    res.json({
      success: true,
      message: `Payment ${status} successfully`
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ error: err.message || 'Failed to verify payment' });
  }
};
