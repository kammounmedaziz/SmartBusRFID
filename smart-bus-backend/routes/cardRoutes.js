import express from "express";
import Joi from 'joi';
import { validateBody } from '../middleware/validate.js';
import { getCards, rechargeCard, payFare, getTransactions } from "../controllers/cardController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getCards);               // List all cards
const rechargeSchema = Joi.object({ uid: Joi.string().required(), amount: Joi.number().positive().required() });
const paySchema = Joi.object({ uid: Joi.string().required(), fare: Joi.number().positive().required() });

router.post("/recharge", requireAuth(['admin','operator']), validateBody(rechargeSchema), rechargeCard);  // Recharge a card
router.post("/pay", requireAuth(['admin','operator']), validateBody(paySchema), payFare);            // Deduct fare
router.get("/transactions", getTransactions); // All transactions

export default router;
