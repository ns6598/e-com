import { z } from 'zod'

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  department: z.string().trim().optional(),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isSale: z
    .enum(['true', 'false', '1', '0'])
    .transform((val) => val === 'true' || val === '1')
    .optional(),
  featured: z
    .enum(['true', 'false', '1', '0'])
    .transform((val) => val === 'true' || val === '1')
    .optional(),
  isNew: z
    .enum(['true', 'false', '1', '0'])
    .transform((val) => val === 'true' || val === '1')
    .optional(),
  sort: z.enum(['price-asc', 'price-desc', 'newest', 'popularity', 'featured']).default('featured'),
})

export const createProductSchema = z.object({
  name: z.string().trim().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().trim().min(3, 'Unique slug is required').optional(),
  subtitle: z.string().trim().optional().nullable(),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().uuid('Valid category UUID is required'),
  basePrice: z.coerce.number().positive('Base price must be positive'),
  comparisonPrice: z.coerce.number().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  tag: z.string().trim().optional().nullable(),
  materials: z.string().trim().optional().nullable(),
  careInstructions: z.string().trim().optional().nullable(),
  details: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url('Valid image URL required'),
        altText: z.string().optional().nullable(),
        displayOrder: z.number().int().default(0),
      })
    )
    .optional()
    .default([]),
  variants: z
    .array(
      z.object({
        size: z.string().trim().min(1, 'Size is required'),
        color: z.string().trim().min(1, 'Color is required'),
        sku: z.string().trim().optional(),
        stockQuantity: z.number().int().min(0).default(0),
        image: z.string().url().optional().nullable(),
      })
    )
    .optional()
    .default([]),
})

export const updateProductSchema = createProductSchema.partial()

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().trim().min(2).optional(),
  department: z.string().trim().default('Women'),
  description: z.string().trim().optional().nullable(),
  image: z.string().url().optional().nullable(),
})

export const updateCategorySchema = categorySchema.partial()

export const variantSchema = z.object({
  size: z.string().trim().min(1, 'Size is required'),
  color: z.string().trim().min(1, 'Color is required'),
  sku: z.string().trim().min(3, 'SKU must be at least 3 characters').optional(),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative').default(0),
  image: z.string().url().optional().nullable(),
})

export const updateStockSchema = z.object({
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
})
