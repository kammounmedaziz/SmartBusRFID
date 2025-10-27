import User from '../models/userModel.js'
import db from '../config/db.js'
import bcrypt from 'bcrypt'

export const listUsers = async (req, res) => {
  try {
    const users = await User.getAll()
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;

    // If role is provided -> return users by role (with optional search)
    if (role) {
      let sql = `SELECT id, name, email, role FROM users WHERE role = ?`;
      const params = [role];
      
      // Add search term if provided
      if (q && q.trim().length > 0) {
        const searchTerm = `%${q}%`;
        sql += ` AND (name LIKE ? OR email LIKE ?)`;
        params.push(searchTerm, searchTerm);
      }
      
      sql += ` ORDER BY id DESC LIMIT 200`;
      const [users] = await db.query(sql, params);
      return res.json(users);
    }

    // If only search query provided (no role filter)
    if (q && q.trim().length > 0) {
      const searchTerm = `%${q}%`;
      const sql = `SELECT id, name, email, role FROM users WHERE (name LIKE ? OR email LIKE ?) ORDER BY id DESC LIMIT 200`;
      const [users] = await db.query(sql, [searchTerm, searchTerm]);
      return res.json(users);
    }

    // No query and no role: return empty array to avoid exposing all users
    return res.json([]);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getUserCount = async (req, res) => {
  try {
    const [result] = await db.query('SELECT COUNT(*) as count FROM users')
    res.json({ count: result[0].count })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'operator' } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const exists = await User.existsByEmail(email)
    if (exists) return res.status(409).json({ error: 'user already exists' })
    const hash = await bcrypt.hash(password, 10)
    const id = await User.create({ name, email, password_hash: hash, role })
    res.status(201).json({ id, email, name, role })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    
    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    // Check if user exists
    const user = await User.getById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [id])
    res.json({ message: 'User deleted successfully', id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// Reports: aggregate fare collected by day (last 14 days)
export const reportsFareByDay = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE(created_at) as day, SUM(amount) as total FROM transactions WHERE type='payment' GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 14`
    )
    res.json(rows.reverse())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export default { listUsers, searchUsers, createUser, deleteUser, getUserCount, reportsFareByDay }
