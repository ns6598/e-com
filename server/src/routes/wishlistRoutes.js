import { Router } from 'express'
import { getWishlist, toggleWishlistItem } from '../controllers/wishlistController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', requireAuth, getWishlist)
router.post('/toggle', requireAuth, toggleWishlistItem)

export default router
