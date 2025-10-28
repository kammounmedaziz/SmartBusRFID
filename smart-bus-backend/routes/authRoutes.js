import express from 'express';
import { login, me, register, updateFaceSettings } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', requireAuth(), me);
// Face auth settings for authenticated users
router.put('/me/settings/face', requireAuth(), updateFaceSettings);

export default router;
