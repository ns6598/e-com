import { Router } from 'express'
import { validateCoupon } from '../controllers/couponController.js'
import { validate } from '../middleware/validate.js'
import { validateCouponSchema } from '../validators/couponValidator.js'

const router = Router()

router.post('/validate', validate(validateCouponSchema), validateCoupon)

export default router
