import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import aiService from "../services/aiService.js";

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

export const login = async (req, res) => {
  try {
    // support two login methods: 'password' (default) or 'face'
    const { loginMethod = 'password', email, password, image } = req.body || {};

    if (loginMethod === 'face') {
      if (!image) return res.status(400).json({ error: 'Face image required for face login' });
      // Call AI service to verify face
      const result = await aiService.verifyFace(image);
      console.log('Face verification result:', JSON.stringify(result, null, 2));
      
      if (!result.success || !result.matched) {
        console.log('Face not matched. Result:', result);
        return res.status(401).json({ error: 'Face not recognized' });
      }

      const matchedUserId = result.userId;
      console.log('Matched user ID:', matchedUserId);
      
      // Fetch user by id
      const user = await User.getById(matchedUserId);
      console.log('User from database:', user);
      
      if (!user) {
        console.log(`User ID ${matchedUserId} not found in database`);
        return res.status(401).json({ error: 'User not found for matched face' });
      }

      const tokenFace = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token: tokenFace, method: 'face', matchedUserId, confidence: result.confidence });
    }

    // Default: password login
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, method: 'password' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, face_image } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const exists = await User.existsByEmail(email);
    if (exists) return res.status(409).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    // Always register new users with 'user' role (for passengers/clients)
    const id = await User.create({ name, email, password_hash: hash, role: 'user' });

    // If front-end included face_image (base64), register it with AI service
    let faceResult = null;
    if (face_image) {
      try {
        faceResult = await aiService.registerFace(id, face_image, name || email);
      } catch (e) {
        console.error('Face registration during user register failed:', e?.message || e);
        // Don't fail the whole registration; return with a warning
      }
    }

    res.status(201).json({ id, email, name, role: 'user', face_registered: faceResult?.success || false });
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
    // Use getById (available in userModel) to fetch user by id
    const user = await User.getById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ id: user.id, role: user.role, name: user.name, email: user.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// Allow authenticated users to enable/disable face auth from settings
export const updateFaceSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { action, image } = req.body || {}; // action: 'enable' | 'disable'
    if (!action || !['enable', 'disable'].includes(action)) return res.status(400).json({ error: 'Invalid action' });

    if (action === 'enable') {
      if (!image) return res.status(400).json({ error: 'Face image required to enable face auth' });
      // fetch user to get name/email
      const user = await User.getById(userId);
      const displayName = (user && (user.name || user.email)) || `user_${userId}`;
      const result = await aiService.registerFace(userId, image, displayName);
      if (!result.success) return res.status(500).json({ error: 'Failed to register face' });
      return res.json({ success: true, message: 'Face authentication enabled' });
    }

    // disable
    const del = await aiService.deleteFace(userId);
    if (!del.success) return res.status(500).json({ error: 'Failed to remove face registration' });
    return res.json({ success: true, message: 'Face authentication disabled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export default { login, register, me, updateFaceSettings };
