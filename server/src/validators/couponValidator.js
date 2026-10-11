import { z } from 'zod'

export const validateCouponSchema = z.object({
  code: z.string().trim().min(2, 'Coupon code is required'),
  subtotal: z.coerce.number().nonnegative().optional().default(0),
})

export const createCouponSchema = z.object({
  code: z.string().trim().min(2, 'Coupon code must be at least 2 characters').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  discountValue: z.coerce.number().positive('Discount value must be positive'),
  minOrderValue: z.coerce.number().positive().optional().nullable(),
  startDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const updateCouponSchema = createCouponSchema.partial()
