import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const exists = await User.existsByEmail(email)
    if (exists) return res.status(409).json({ error: 'User already exists' })
    const hash = await bcrypt.hash(password, 10)
    const id = await User.create({ name, email, password_hash: hash, role })
    res.status(201).json({ id, email, name, role })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const me = async (req, res) => {
  try {
    // requireAuth sets req.user
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    // fetch from DB to return fresh info
    const user = await User.findById ? await User.findById(userId) : await User.findByEmail(req.user.email || '')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ id: user.id, role: user.role, name: user.name, email: user.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export default { login, me };
