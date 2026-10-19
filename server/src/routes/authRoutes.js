import { Router } from 'express'
import { register, login, vaultLogin, logout, getMe, updateProfile } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', loginLimiter, validate(loginSchema), login)
router.post('/vault-login', loginLimiter, validate(loginSchema), vaultLogin)
router.post('/logout', logout)
router.get('/me', requireAuth, getMe)
router.put('/profile', requireAuth, validate(updateProfileSchema), updateProfile)

export default router
