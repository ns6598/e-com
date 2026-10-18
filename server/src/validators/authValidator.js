import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
})

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
  phone: z.string().trim().max(30).optional(),
})

export const addressSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required').max(100),
  phone: z.string().trim().min(6, 'Valid contact phone number is required').max(30),
  addressLine1: z.string().trim().min(5, 'Street address is required').max(200),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State / Province is required').max(100),
  postalCode: z.string().trim().min(3, 'Postal / ZIP code is required').max(20),
  isDefault: z.boolean().optional().default(false),
})

export const updateAddressSchema = addressSchema.partial()
