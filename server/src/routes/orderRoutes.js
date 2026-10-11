import { Router } from 'express'
import { createOrder, getOrderById } from '../controllers/orderController.js'
import { validate } from '../middleware/validate.js'
import { optionalAuth } from '../middleware/authMiddleware.js'
import { createOrderSchema } from '../validators/orderValidator.js'

const router = Router()

router.post('/', optionalAuth, validate(createOrderSchema), createOrder)
router.get('/:id', getOrderById)

export default router
