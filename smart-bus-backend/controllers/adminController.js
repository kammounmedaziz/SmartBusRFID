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
    const { q } = req.query
    
    // If no query or empty, return empty array (don't list all users)
    // Use listUsers endpoint for getting all users count
    if (!q || q.trim().length === 0) {
      return res.json([])
    }

    const searchTerm = `%${q}%`
    const [users] = await db.query(
      `SELECT id, name, email, role, created_at 
       FROM users 
       WHERE name LIKE ? OR email LIKE ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [searchTerm, searchTerm]
    )
    res.json(users)
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
