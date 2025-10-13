import express from 'express'
import { listUsers, reportsFareByDay } from '../controllers/adminController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/users', requireAuth(['admin']), listUsers)
router.get('/reports/fare-by-day', requireAuth(['admin']), reportsFareByDay)

export default router
