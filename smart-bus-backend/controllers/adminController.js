import User from '../models/userModel.js'
import db from '../config/db.js'

export const listUsers = async (req, res) => {
  try {
    const users = await User.getAll()
    res.json(users)
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

export default { listUsers, reportsFareByDay }
