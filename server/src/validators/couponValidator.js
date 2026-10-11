import { z } from 'zod'

export const validateCouponSchema = z.object({
  code: z.string().trim().min(2, 'Coupon code is required'),
  subtotal: z.number().nonnegative().optional().default(0),
})
