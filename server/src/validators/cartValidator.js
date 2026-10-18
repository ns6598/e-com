import { z } from 'zod'

export const addToCartSchema = z
  .object({
    variantId: z.string().optional(),
    productId: z.string().optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  })
  .refine((data) => data.variantId || data.productId, {
    message: 'Either variantId or productId is required',
  })

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})
