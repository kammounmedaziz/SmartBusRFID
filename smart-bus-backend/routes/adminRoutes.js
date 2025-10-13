import express from 'express'
import { listUsers, reportsFareByDay, createUser } from '../controllers/adminController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/users', requireAuth(['admin']), listUsers)
router.post('/users', requireAuth(['admin']), createUser)
router.get('/reports/fare-by-day', requireAuth(['admin']), reportsFareByDay)

export default router
