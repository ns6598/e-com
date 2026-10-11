import { Router } from 'express'
import { getCart, addToCart, removeCartItem } from '../controllers/cartController.js'
import { optionalAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', optionalAuth, getCart)
router.post('/items', optionalAuth, addToCart)
router.delete('/items/:itemId', optionalAuth, removeCartItem)

export default router
