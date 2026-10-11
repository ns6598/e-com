import { Router } from 'express'
import { register, login, logout, getMe, updateProfile } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { registerSchema, loginSchema } from '../validators/authValidator.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/logout', logout)
router.get('/me', requireAuth, getMe)
router.put('/profile', requireAuth, updateProfile)

export default router

