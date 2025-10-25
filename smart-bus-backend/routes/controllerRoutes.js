import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  validateTicket,
  getMyValidations,
  getMyStats,
  logAction,
  getAllValidations,
  getAllControllerLogs
} from "../controllers/controllerController.js";

const router = express.Router();

// Controller routes
router.post('/validate', requireAuth(['controller']), validateTicket);
router.get('/my-validations', requireAuth(['controller']), getMyValidations);
router.get('/my-stats', requireAuth(['controller']), getMyStats);
router.post('/log-action', requireAuth(['controller']), logAction);

// Admin routes
router.get('/all-validations', requireAuth(['admin']), getAllValidations);
router.get('/all-logs', requireAuth(['admin']), getAllControllerLogs);

export default router;
