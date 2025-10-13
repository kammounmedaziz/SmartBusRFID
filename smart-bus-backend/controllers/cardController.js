import Card from "../models/cardModel.js";
import Transaction from "../models/transactionModel.js";
import db from "../config/db.js";

// Get all cards
export const getCards = async (req, res) => {
  try {
    const cards = await Card.getAll();
    res.json({ data: cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Recharge card
export const rechargeCard = async (req, res) => {
  try {
    const body = req.body || {};
    const { uid, amount } = body;
    if (!uid || amount == null) return res.status(400).json({ error: "UID and amount required" });
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
    res.status(500).json({ error: "Server error" });
  }
};

// Deduct fare manually
export const payFare = async (req, res) => {
  try {
    const { uid, fare } = req.body;
    if (!uid || fare == null) return res.status(400).json({ error: "UID and fare required" });
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
    res.status(500).json({ error: "Server error" });
  }
};

// Get transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAll();
    res.json({ data: transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
