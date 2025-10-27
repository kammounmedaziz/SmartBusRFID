import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getOperatorStats,
  searchUsers,
  createUser,
  deleteUser,
  getAllPayments,
  getPendingPayments,
  verifyPayment
} from '../controllers/operatorController.js';

const router = express.Router();

// All routes require operator or admin role
// Statistics
router.get('/stats', requireAuth(['operator', 'admin']), getOperatorStats);

// User Management
router.get('/users/search', requireAuth(['operator', 'admin']), searchUsers);
router.post('/users', requireAuth(['operator', 'admin']), createUser);
router.delete('/users/:id', requireAuth(['operator', 'admin']), deleteUser);

// Payment Verification
router.get('/payments/all', requireAuth(['operator', 'admin']), getAllPayments);
router.get('/payments/pending', requireAuth(['operator', 'admin']), getPendingPayments);
router.patch('/payments/:id/verify', requireAuth(['operator', 'admin']), verifyPayment);

export default router;
