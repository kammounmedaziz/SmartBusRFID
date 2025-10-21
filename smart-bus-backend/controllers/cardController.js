import Card from "../models/cardModel.js";
import Transaction from "../models/transactionModel.js";
import db from "../config/db.js";

// helper to assert ownership when role === 'user'
async function ensureCardOwnership(cardId, userId, conn) {
  const [rows] = await conn.query('SELECT user_id FROM cards WHERE id = ? FOR UPDATE', [cardId]);
  if (!rows || rows.length === 0) {
    const err = new Error('Card not found');
    err.status = 404;
    throw err;
  }
  const ownerId = rows[0].user_id;
  if (ownerId !== userId) {
    const err = new Error('Forbidden: not your card');
    err.status = 403;
    throw err;
  }
}

// Get all cards
export const getCards = async (req, res) => {
  try {
    // if user is a normal client, return only their cards
    if (req.user && req.user.role === 'user') {
      const cards = await Card.findByUserId(req.user.id);
      return res.json({ data: cards });
    }
    const cards = await Card.getAll();
    res.json({ data: cards });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};


// Recharge card
export const rechargeCard = async (req, res) => {
  try {
    const body = req.body || {};
    const { uid, amount } = body;
    if (!uid || amount == null) return res.status(400).json({ error: 'UID and amount required' });
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'Amount must be a positive number' });
    // Use a DB transaction to avoid race conditions
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // lock the row
      const [rows] = await connection.query('SELECT * FROM cards WHERE uid = ? FOR UPDATE', [uid]);
      if (rows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Card not found' });
      }
      const card = rows[0];
      // if the requester is a normal user, ensure ownership
      if (req.user && req.user.role === 'user') {
        if (card.user_id !== req.user.id) {
          await connection.rollback();
          connection.release();
          return res.status(403).json({ error: 'Forbidden: not your card' });
        }
      }
      const newBalance = parseFloat(card.balance) + amt;
      await connection.query('UPDATE cards SET balance = ? WHERE uid = ?', [newBalance, uid]);
      await connection.query('INSERT INTO transactions (card_id, amount, type) VALUES (?, ?, ?)', [card.id, amt, 'recharge']);
      await connection.commit();
      connection.release();
      res.json({ message: 'Card recharged successfully', new_balance: newBalance });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Deduct fare manually
export const payFare = async (req, res) => {
  try {
    const { uid, fare } = req.body;
    if (!uid || fare == null) return res.status(400).json({ error: 'UID and fare required' });
    const amt = parseFloat(fare);
    if (Number.isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'Fare must be a positive number' });

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query('SELECT * FROM cards WHERE uid = ? FOR UPDATE', [uid]);
      if (rows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Card not found' });
      }
      const card = rows[0];
      // if the requester is a normal user, ensure ownership
      if (req.user && req.user.role === 'user') {
        if (card.user_id !== req.user.id) {
          await connection.rollback();
          connection.release();
          return res.status(403).json({ error: 'Forbidden: not your card' });
        }
      }
      if (parseFloat(card.balance) < amt) {
        await connection.rollback();
        connection.release();
        return res.status(402).json({ error: 'Insufficient balance' });
      }
      const newBalance = parseFloat(card.balance) - amt;
      await connection.query('UPDATE cards SET balance = ? WHERE uid = ?', [newBalance, uid]);
      await connection.query('INSERT INTO transactions (card_id, amount, type) VALUES (?, ?, ?)', [card.id, amt, 'payment']);
      await connection.commit();
      connection.release();
      res.json({ message: 'Payment successful', new_balance: newBalance });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAll();
    res.json({ data: transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin creates a card (must include user_id)
export const createCard = async (req, res) => {
  try {
    const { uid, user_id, balance = 0, status = 'active' } = req.body || {}
    if (!uid || !user_id) return res.status(400).json({ error: 'uid and user_id required' })
    // ensure user exists
    const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [user_id])
    if (!rows || rows.length === 0) return res.status(400).json({ error: 'user not found' })
    const id = await Card.createCard({ uid, user_id, balance, status })
    res.status(201).json({ id, uid, user_id, balance, status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// Authenticated user creates their own card
export const createCardForMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    const { uid, balance = 0, status = 'active' } = req.body || {}
    if (!uid) return res.status(400).json({ error: 'uid required' })
    const id = await Card.createCard({ uid, user_id: req.user.id, balance, status })
    res.status(201).json({ id, uid, user_id: req.user.id, balance, status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getMyTransactions = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const transactions = await Transaction.getByUserId(req.user.id);
    res.json({ data: transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// user-scoped endpoints
export const getMyCards = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const cards = await Card.findByUserId(req.user.id);
    res.json({ data: cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const payWithMyCard = async (req, res) => {
  const { card_id, amount } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // ensure ownership and lock
    await ensureCardOwnership(card_id, req.user.id, connection);
    const [cards] = await connection.query('SELECT * FROM cards WHERE id = ? FOR UPDATE', [card_id]);
    const card = cards[0];
    const newBalance = parseFloat(card.balance) - parseFloat(amount);
    if (newBalance < 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    await connection.query('UPDATE cards SET balance = ? WHERE id = ?', [newBalance, card_id]);
    await connection.query('INSERT INTO transactions (card_id, amount, type) VALUES (?, ?, ?)', [card.id, amount, 'payment']);
    await connection.commit();
    connection.release();
    res.json({ success: true, balance: newBalance });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};

// User-scoped recharge (add funds to owned card)
export const rechargeMyCard = async (req, res) => {
  try {
    const { card_id, amount } = req.body;
    if (!card_id || amount == null) return res.status(400).json({ error: 'card_id and amount required' });
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // ensure ownership and lock
      await ensureCardOwnership(card_id, req.user.id, conn);
      const [rows] = await conn.query('SELECT * FROM cards WHERE id = ? FOR UPDATE', [card_id]);
      if (rows.length === 0) {
        await conn.rollback(); conn.release();
        return res.status(404).json({ error: 'Card not found' });
      }
      const card = rows[0];
      const newBalance = parseFloat(card.balance) + parseFloat(amount);
      await conn.query('UPDATE cards SET balance = ? WHERE id = ?', [newBalance, card_id]);
      await conn.query('INSERT INTO transactions (card_id, amount, type) VALUES (?, ?, ?)', [card.id, amount, 'recharge']);
      await conn.commit(); conn.release();
      res.json({ message: 'Card recharged', new_balance: newBalance });
    } catch (err) {
      await conn.rollback(); conn.release();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a user's own card
export const deleteMyCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id, 10);
    if (!cardId) return res.status(400).json({ error: 'Invalid card id' });
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await ensureCardOwnership(cardId, req.user.id, conn);
      await conn.query('DELETE FROM cards WHERE id = ?', [cardId]);
      await conn.commit(); conn.release();
      res.json({ message: 'Card deleted' });
    } catch (err) {
      await conn.rollback(); conn.release();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


