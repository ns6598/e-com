import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be greater than zero'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  size: z.string().optional(),
  color: z.string().optional(),
  image: z.string().optional(),
})

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Full customer name is required'),
  customerEmail: z.string().trim().email('Valid email address is required'),
  customerPhone: z.string().trim().min(7, 'Contact phone number is required'),
  address: z.string().trim().min(5, 'Delivery street address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State / Province is required'),
  postalCode: z.string().trim().min(3, 'Postal / PIN code is required'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  subtotal: z.number().nonnegative().optional(),
  shipping: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  paymentMethod: z.string().default('atelier_cod'),
})
