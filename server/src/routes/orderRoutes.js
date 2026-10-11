import { Router } from 'express'
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { validate } from '../middleware/validate.js'
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/authMiddleware.js'
import { createOrderSchema } from '../validators/orderValidator.js'

const router = Router()

// Public or Customer Orders
router.get('/', requireAuth, listOrders)
router.post('/', optionalAuth, validate(createOrderSchema), createOrder)
router.get('/:id', getOrderById)

// Admin Order Management
router.patch('/:id/status', requireAuth, requireAdmin, updateOrderStatus)

export default router

