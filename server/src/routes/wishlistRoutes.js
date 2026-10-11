import { Router } from 'express'
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  toggleWishlistItem,
} from '../controllers/wishlistController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import { addWishlistItemSchema } from '../validators/wishlistValidator.js'

const router = Router()

// All wishlist operations require an authenticated customer
router.use(requireAuth)

router.get('/', getWishlist)
router.post('/items', validate(addWishlistItemSchema), addWishlistItem)
router.delete('/items/:productId', removeWishlistItem)
router.post('/toggle', validate(addWishlistItemSchema), toggleWishlistItem)

export default router
