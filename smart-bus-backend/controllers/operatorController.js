import User from '../models/userModel.js';
import db from '../config/db.js';
import bcrypt from 'bcrypt';

// Get operator dashboard statistics
export const getOperatorStats = async (req, res) => {
  try {
    console.log('📊 Fetching operator stats...');
    
    // Get total users count
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('👥 Total users:', userCount[0].count);
    
    // Get active cards count
    const [cardCount] = await db.query('SELECT COUNT(*) as count FROM cards WHERE status = ?', ['active']);
    console.log('💳 Active cards:', cardCount[0].count);
    
    // Get pending payments count
    const [pendingCount] = await db.query(
      'SELECT COUNT(*) as count FROM manual_payments WHERE status = ?', 
      ['pending']
    );
    console.log('⏳ Pending payments:', pendingCount[0].count);
    
    // Get verified payments today
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today date:', today);
    
    const [verifiedToday] = await db.query(
      'SELECT COUNT(*) as count FROM manual_payments WHERE status = ? AND DATE(verified_at) = ?',
      ['verified', today]
    );
    console.log('✅ Verified today:', verifiedToday[0].count);
    
    // Also get total verified for debugging
    const [totalVerified] = await db.query(
      'SELECT COUNT(*) as count FROM manual_payments WHERE status = ?',
      ['verified']
    );
    console.log('📈 Total verified ever:', totalVerified[0].count);

    const stats = {
      totalUsers: userCount[0].count,
      activeCards: cardCount[0].count,
      pendingPayments: pendingCount[0].count,
      verifiedToday: verifiedToday[0].count
    };
    
    console.log('📊 Sending stats:', stats);
    res.json(stats);
  } catch (err) {
    console.error('❌ Error fetching operator stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Search users by name or email
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    console.log('🔍 Search users request:', { q, type: typeof q });

    // If no query, return all users (limited for performance)
    if (!q || q.trim().length === 0) {
      console.log('📋 Returning all users (no search query)');
      const [users] = await db.query(
        `SELECT id, name, email, role
         FROM users
         ORDER BY id DESC
         LIMIT 100`
      );
      console.log(`✅ Found ${users.length} users`);
      return res.json(users);
    }

    const searchTerm = `%${q.trim()}%`;
    console.log('🔎 Searching for:', searchTerm);
    
    const [users] = await db.query(
      `SELECT id, name, email, role
       FROM users
       WHERE name LIKE ? OR email LIKE ?
       ORDER BY id DESC
       LIMIT 50`,
      [searchTerm, searchTerm]
    );

    console.log(`✅ Search found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('❌ Error searching users:', err);
    res.status(500).json({ error: 'Failed to search users', details: err.message });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const exists = await User.existsByEmail(email);
    if (exists) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Create user
    const id = await User.create({ 
      name, 
      email, 
      password_hash: hash, 
      role 
    });

    res.status(201).json({ 
      id, 
      email, 
      name, 
      role,
      message: 'User created successfully' 
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ 
      message: 'User deleted successfully', 
      id 
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get all manual payments
export const getAllPayments = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT 
        mp.id,
        mp.user_id,
        mp.amount,
        mp.payment_method,
        mp.reference_number,
        mp.notes,
        mp.created_at,
        mp.verified_by,
        mp.verified_at,
        mp.status,
        u.name as user_name,
        v.name as verified_by_name
       FROM manual_payments mp
       LEFT JOIN users u ON mp.user_id = u.id
       LEFT JOIN users v ON mp.verified_by = v.id
       ORDER BY mp.created_at DESC`
    );
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get pending manual payments
export const getPendingPayments = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT 
        mp.id,
        mp.user_id,
        mp.amount,
        mp.payment_method,
        mp.reference_number,
        mp.notes,
        mp.created_at,
        mp.status,
        u.name as user_name
       FROM manual_payments mp
       LEFT JOIN users u ON mp.user_id = u.id
       WHERE mp.status = 'pending'
       ORDER BY mp.created_at DESC`
    );
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching pending payments:', err);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
};

// Verify or reject a manual payment
export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('🔍 Verify payment request:', { id, status, userId: req.user?.id });

    // Validate status
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "verified" or "rejected"' });
    }

    // Check if payment exists
    const [payments] = await db.query('SELECT * FROM manual_payments WHERE id = ?', [id]);
    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = payments[0];
    console.log('💳 Payment found:', payment);

    // Check if req.user exists (from auth middleware)
    if (!req.user || !req.user.id) {
      console.error('❌ No user in request - auth middleware issue');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Update payment status
    await db.query(
      'UPDATE manual_payments SET status = ?, verified_by = ?, verified_at = NOW() WHERE id = ?',
      [status, req.user.id, id]
    );

    console.log('✅ Payment status updated to:', status);

    // If verified, add balance to user's card
    if (status === 'verified') {
      // Find user's card
      const [cards] = await db.query('SELECT * FROM cards WHERE user_id = ?', [payment.user_id]);
      
      if (cards.length > 0) {
        const card = cards[0];
        const newBalance = parseFloat(card.balance) + parseFloat(payment.amount);
        
        console.log('💰 Updating card balance:', { cardId: card.id, oldBalance: card.balance, newBalance });
        
        // Update card balance
        await db.query('UPDATE cards SET balance = ? WHERE id = ?', [newBalance, card.id]);
        
        // Create transaction record
        await db.query(
          'INSERT INTO transactions (card_id, amount, type, description) VALUES (?, ?, ?, ?)',
          [card.id, payment.amount, 'recharge', `Manual payment verified - Ref: ${payment.reference_number || 'N/A'}`]
        );
        
        console.log('✅ Card balance updated and transaction created');
      } else {
        console.warn('⚠️  No card found for user:', payment.user_id);
      }
    }

    res.json({ 
      message: `Payment ${status} successfully`,
      id,
      status 
    });
  } catch (err) {
    console.error('❌ Error verifying payment:', err);
    res.status(500).json({ error: 'Failed to verify payment', details: err.message });
  }
};

export default {
  getOperatorStats,
  searchUsers,
  createUser,
  deleteUser,
  getAllPayments,
  getPendingPayments,
  verifyPayment
};
