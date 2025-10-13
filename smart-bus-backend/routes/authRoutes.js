import express from 'express';
import { login, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { register } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', requireAuth(), me);

export default router;
