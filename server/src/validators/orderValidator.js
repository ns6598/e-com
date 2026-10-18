import { z } from 'zod'

export const orderItemInputSchema = z.object({
  variantId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  name: z.string().optional(),
  price: z.number().optional(), // Server recalculates authoritative price
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
})

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Full customer name is required').optional(),
  customerEmail: z.string().trim().email('Valid email address is required').optional(),
  customerPhone: z.string().trim().min(6, 'Contact phone number is required').optional(),
  addressId: z.string().trim().optional().nullable(),
  cartId: z.string().trim().optional().nullable(),
  address: z.string().trim().min(5, 'Delivery street address is required').optional(),
  city: z.string().trim().min(2, 'City is required').optional(),
  state: z.string().trim().min(2, 'State / Province is required').optional(),
  postalCode: z.string().trim().min(3, 'Postal / PIN code is required').optional(),
  shippingAddress: z
    .object({
      name: z.string().trim().min(2),
      phone: z.string().trim().min(6),
      addressLine1: z.string().trim().min(5),
      addressLine2: z.string().trim().optional().nullable(),
      city: z.string().trim().min(2),
      state: z.string().trim().min(2),
      postalCode: z.string().trim().min(3),
    })
    .optional(),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one silhouette item'),
  couponCode: z.string().trim().optional().nullable(),
  paymentMethod: z.string().default('atelier_cod'),
  idempotencyKey: z.string().trim().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
})
