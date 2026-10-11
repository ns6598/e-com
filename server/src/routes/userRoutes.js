import { Router } from 'express'
import {
  getCurrentUser,
  updateCurrentUser,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from '../controllers/userController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
} from '../validators/authValidator.js'

const router = Router()

// All customer routes require authentication
router.use(requireAuth)

// Profile endpoints
router.get('/me', getCurrentUser)
router.patch('/me', validate(updateProfileSchema), updateCurrentUser)

// Address endpoints
router.get('/me/addresses', getUserAddresses)
router.post('/me/addresses', validate(addressSchema), createUserAddress)
router.patch('/me/addresses/:addressId', validate(updateAddressSchema), updateUserAddress)
router.delete('/me/addresses/:addressId', deleteUserAddress)

export default router
