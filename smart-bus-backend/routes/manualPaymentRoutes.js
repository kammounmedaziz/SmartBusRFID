import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createManualPayment,
  getMyPayments,
  getAllPayments,
  getPendingPayments,
  verifyPayment
} from "../controllers/manualPaymentController.js";

const router = express.Router();

// User routes
router.post('/', requireAuth(['user']), createManualPayment);
router.get('/my-payments', requireAuth(['user']), getMyPayments);

// Admin routes
router.get('/all', requireAuth(['admin']), getAllPayments);
router.get('/pending', requireAuth(['admin']), getPendingPayments);
router.patch('/:id/verify', requireAuth(['admin']), verifyPayment);

export default router;
