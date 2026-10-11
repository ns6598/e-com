import { Router } from 'express'
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidator.js'

const router = Router()

// All order operations require authenticated customer
router.post('/', requireAuth, validate(createOrderSchema), createOrder)
router.get('/', requireAuth, listOrders)
router.get('/:id', requireAuth, getOrderById)
router.patch('/:id/status', requireAuth, requireAdmin, validate(updateOrderStatusSchema), updateOrderStatus)

export default router
