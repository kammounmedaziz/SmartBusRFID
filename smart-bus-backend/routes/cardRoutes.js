import express from "express";
import Joi from 'joi';
import { validateBody } from '../middleware/validate.js';
import { getCards, rechargeCard, payFare, getTransactions, getMyCards, payWithMyCard, getMyTransactions, rechargeMyCard, deleteMyCard } from "../controllers/cardController.js";
import { createCard, createCardForMe } from "../controllers/cardController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getCards);               // List all cards
const rechargeSchema = Joi.object({ uid: Joi.string().required(), amount: Joi.number().positive().required() });
const paySchema = Joi.object({ uid: Joi.string().required(), fare: Joi.number().positive().required() });

router.post("/recharge", requireAuth(['admin','operator']), validateBody(rechargeSchema), rechargeCard);  // Recharge a card
router.post("/pay", requireAuth(['admin','operator']), validateBody(paySchema), payFare);            // Deduct fare
router.get("/transactions", getTransactions); // All transactions

// Create card (admin)
router.post('/', requireAuth(['admin']), createCard);

// Create card for authenticated user
router.post('/me', requireAuth(['user']), createCardForMe);

// user-scoped: get cards for the authenticated user
router.get('/me/cards', requireAuth(['user']), getMyCards);
// user-scoped: pay using one of the user's cards (body: { card_id, amount })
router.post('/me/pay', requireAuth(['user']), payWithMyCard);
// user-scoped: recharge one of the user's cards
router.post('/me/recharge', requireAuth(['user']), validateBody(Joi.object({ card_id: Joi.number().required(), amount: Joi.number().positive().required() })), rechargeMyCard);
// user-scoped: delete a card by id
router.delete('/me/:id', requireAuth(['user']), deleteMyCard);
// user-scoped: transactions
router.get('/me/transactions', requireAuth(['user']), getMyTransactions);

export default router;
