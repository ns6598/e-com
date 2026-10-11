import { Router } from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from '../controllers/cartController.js'
import { optionalAuth } from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import { addToCartSchema, updateCartItemSchema } from '../validators/cartValidator.js'

const router = Router()

router.get('/', optionalAuth, getCart)
router.post('/items', optionalAuth, validate(addToCartSchema), addToCart)
router.patch('/items/:itemId', optionalAuth, validate(updateCartItemSchema), updateCartItem)
router.delete('/items/:itemId', optionalAuth, removeCartItem)

export default router
