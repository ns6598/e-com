import { Router } from 'express'
import {
  getPaymentConfig,
  createPaymentSession,
  verifyPayment,
  handlePaymentWebhook,
} from '../controllers/paymentController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

// Public payment configuration check
router.get('/config', getPaymentConfig)

// Authenticated customer payment routes
router.post('/create-session', requireAuth, createPaymentSession)
router.post('/verify', requireAuth, verifyPayment)

// Public Webhook listener (protected by cryptographic signature verification, not cookies)
router.post('/webhook/:provider', handlePaymentWebhook)

export default router
