import express from 'express';
import Joi from 'joi';
import { validateBody } from '../middleware/validate.js';
import { validateESP32ApiKey, validateDeviceMAC } from '../middleware/esp32Auth.js';
import {
  checkCardRFID,
  payFareRFID,
  getDefaultFare,
  healthCheck,
  getCardTransactions
} from '../controllers/esp32Controller.js';

const router = express.Router();

// Validation schemas
const paySchema = Joi.object({
  uid: Joi.string().required(),
  fare: Joi.number().positive().optional(),
  device_id: Joi.string().optional(),
  location: Joi.string().optional()
});

// Health check (no auth required)
router.get('/health', healthCheck);

// Get default fare configuration (no auth required)
router.get('/config', getDefaultFare);

// Apply ESP32 authentication middleware to all routes below
router.use(validateESP32ApiKey);
// Optional: Add MAC whitelist validation
// router.use(validateDeviceMAC);

// Check card info (pre-flight check)
router.get('/check/:uid', checkCardRFID);

// Process payment
router.post('/pay', validateBody(paySchema), payFareRFID);

// Get card transaction history
router.get('/transactions/:uid', getCardTransactions);

export default router;
