import express from 'express'
import { listUsers, reportsFareByDay, createUser, searchUsers, deleteUser } from '../controllers/adminController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Allow both admin and operator roles
router.get('/users', requireAuth(['admin', 'operator']), listUsers)
router.get('/users/search', requireAuth(['admin', 'operator']), searchUsers)
router.post('/users', requireAuth(['admin', 'operator']), createUser)
router.delete('/users/:id', requireAuth(['admin', 'operator']), deleteUser)
router.get('/reports/fare-by-day', requireAuth(['admin', 'operator']), reportsFareByDay)

export default router
