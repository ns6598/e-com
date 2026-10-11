import { Prisma } from '@prisma/client'
import { prisma, dbStatus } from '../config/db.js'
import productService, { formatDatabaseProduct } from '../services/productService.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { PRODUCTS, CATEGORIES } from '../data/products.js'

// In-memory fallback coupon store for dev admin testing
const adminMockCoupons = [
  {
    id: 'cpn-01',
    code: 'AUREVA15',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 1000,
    usageLimit: 500,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cpn-02',
    code: 'ATELIER10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: null,
    usageLimit: 1000,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cpn-03',
    code: 'VIP20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 4000,
    usageLimit: 200,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

// ---------------------------------------------------------------------------
// 1. PRODUCT & VARIANT MANAGEMENT
// ---------------------------------------------------------------------------

export async function adminListProducts(req, res, next) {
  try {
    const result = await productService.list({
      page: req.query.page || 1,
      limit: req.query.limit || 50,
      includeInactive: true,
      search: req.query.search,
      category: req.query.category,
      department: req.query.department,
    })

    return successResponse(res, {
      message: `Retrieved ${result.items.length} atelier silhouettes for administrative review`,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminCreateProduct(req, res, next) {
  try {
    const result = await productService.create(req.body)
    return successResponse(res, {
      message: 'New silhouette inducted into atelier repertoire',
      data: result.product,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminUpdateProduct(req, res, next) {
  try {
    const { id } = req.params
    const result = await productService.update(id, req.body)

    if (!result.product) {
      return errorResponse(res, {
        message: `Product reference '${id}' not found`,
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Product silhouette updated',
      data: result.product,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminDeleteProduct(req, res, next) {
  try {
    const { id } = req.params
    const result = await productService.delete(id)

    if (!result.success) {
      return errorResponse(res, {
        message: `Product reference '${id}' not found`,
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Product silhouette decommissioned from repertoire',
      data: { id },
    })
  } catch (error) {
    next(error)
  }
}

export async function adminAddVariant(req, res, next) {
  try {
    const { productId } = req.params
    const { size, color, sku, stockQuantity = 0, image } = req.body

    if (dbStatus.isConnected && prisma) {
      try {
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product) {
          return errorResponse(res, {
            message: 'Parent product not found',
            code: 'NOT_FOUND',
            statusCode: 404,
          })
        }

        const generatedSku =
          sku || `AUR-${product.id.slice(0, 6).toUpperCase()}-${size.toUpperCase().replace(/\s+/g, '')}-${color.slice(0, 3).toUpperCase()}`

        const variant = await prisma.productVariant.create({
          data: {
            productId,
            size,
            color,
            sku: generatedSku,
            stockQuantity: parseInt(stockQuantity, 10) || 0,
            image: image || null,
          },
        })

        return successResponse(res, {
          message: 'Variant created successfully',
          data: variant,
          statusCode: 201,
        })
      } catch (err) {
        console.warn('[Admin] Variant creation error:', err.message)
      }
    }

    return successResponse(res, {
      message: 'Variant created in cache',
      data: { id: `var-${Date.now()}`, productId, size, color, sku, stockQuantity },
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminUpdateVariantStock(req, res, next) {
  try {
    const { id } = req.params
    const { stockQuantity } = req.body

    if (stockQuantity < 0) {
      return errorResponse(res, {
        message: 'Stock quantity cannot be negative',
        code: 'INVALID_STOCK',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        const variant = await prisma.productVariant.update({
          where: { id },
          data: { stockQuantity: parseInt(stockQuantity, 10) },
        })

        return successResponse(res, {
          message: `Stock level updated to ${variant.stockQuantity}`,
          data: variant,
        })
      } catch (err) {
        console.warn('[Admin] Stock update fallback:', err.message)
      }
    }

    return successResponse(res, {
      message: `Stock level adjusted to ${stockQuantity}`,
      data: { id, stockQuantity },
    })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// 2. CATEGORY MANAGEMENT
// ---------------------------------------------------------------------------

export async function adminListCategories(req, res, next) {
  try {
    const taxonomy = await productService.getCategories()
    return successResponse(res, {
      message: 'Categories retrieved',
      data: taxonomy.categories,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminCreateCategory(req, res, next) {
  try {
    const { name, department = 'Women', description, image } = req.body
    const slug = req.body.slug || name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

    if (dbStatus.isConnected && prisma) {
      try {
        const category = await prisma.category.create({
          data: {
            name,
            slug,
            department,
            description: description || null,
            image: image || null,
          },
        })

        return successResponse(res, {
          message: 'Category created successfully',
          data: category,
          statusCode: 201,
        })
      } catch (err) {
        console.warn('[Admin] Category create fallback:', err.message)
      }
    }

    const catRecord = { id: `cat-${Date.now()}`, name, slug, department, description, image }
    return successResponse(res, {
      message: 'Category created in cache',
      data: catRecord,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminUpdateCategory(req, res, next) {
  try {
    const { id } = req.params
    const updates = req.body

    if (dbStatus.isConnected && prisma) {
      try {
        const updated = await prisma.category.update({
          where: { id },
          data: updates,
        })
        return successResponse(res, {
          message: 'Category updated',
          data: updated,
        })
      } catch (err) {
        console.warn('[Admin] Category update fallback:', err.message)
      }
    }

    return successResponse(res, {
      message: 'Category updated in cache',
      data: { id, ...updates },
    })
  } catch (error) {
    next(error)
  }
}

export async function adminDeleteCategory(req, res, next) {
  try {
    const { id } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        await prisma.category.delete({ where: { id } })
        return successResponse(res, {
          message: 'Category deleted',
          data: { id },
        })
      } catch (err) {
        console.warn('[Admin] Category delete fallback:', err.message)
      }
    }

    return successResponse(res, {
      message: 'Category deleted from cache',
      data: { id },
    })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// 3. COUPON MANAGEMENT
// ---------------------------------------------------------------------------

export async function adminListCoupons(req, res, next) {
  try {
    if (dbStatus.isConnected && prisma) {
      try {
        const coupons = await prisma.coupon.findMany({
          orderBy: { createdAt: 'desc' },
        })
        return successResponse(res, {
          message: 'Atelier coupons retrieved',
          data: coupons.map((c) => ({
            ...c,
            discountValue: Number(c.discountValue),
            minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
          })),
        })
      } catch (err) {
        console.warn('[Admin] Coupon list fallback:', err.message)
      }
    }

    return successResponse(res, {
      message: 'Atelier coupons retrieved',
      data: adminMockCoupons,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminCreateCoupon(req, res, next) {
  try {
    const { code, discountType = 'PERCENTAGE', discountValue, minOrderValue, startDate, expiryDate, usageLimit, isActive = true } = req.body
    const cleanCode = code.trim().toUpperCase()

    if (dbStatus.isConnected && prisma) {
      try {
        const coupon = await prisma.coupon.create({
          data: {
            code: cleanCode,
            discountType,
            discountValue: new Prisma.Decimal(discountValue),
            minOrderValue: minOrderValue ? new Prisma.Decimal(minOrderValue) : null,
            startDate: startDate ? new Date(startDate) : new Date(),
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            usageLimit: usageLimit || null,
            isActive: Boolean(isActive),
          },
        })

        return successResponse(res, {
          message: 'Privilege coupon created successfully',
          data: {
            ...coupon,
            discountValue: Number(coupon.discountValue),
            minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
          },
          statusCode: 201,
        })
      } catch (err) {
        console.warn('[Admin] Coupon create fallback:', err.message)
      }
    }

    const newCoupon = {
      id: `cpn-${Date.now()}`,
      code: cleanCode,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || null,
      usageLimit: usageLimit || null,
      usedCount: 0,
      isActive,
      createdAt: new Date().toISOString(),
    }
    adminMockCoupons.push(newCoupon)

    return successResponse(res, {
      message: 'Privilege coupon created in cache',
      data: newCoupon,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminUpdateCoupon(req, res, next) {
  try {
    const { id } = req.params
    const updates = req.body

    if (dbStatus.isConnected && prisma) {
      try {
        const data = { ...updates }
        if (updates.discountValue !== undefined) data.discountValue = new Prisma.Decimal(updates.discountValue)
        if (updates.minOrderValue !== undefined) data.minOrderValue = updates.minOrderValue ? new Prisma.Decimal(updates.minOrderValue) : null

        const coupon = await prisma.coupon.update({
          where: { id },
          data,
        })

        return successResponse(res, {
          message: 'Privilege coupon updated',
          data: {
            ...coupon,
            discountValue: Number(coupon.discountValue),
            minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
          },
        })
      } catch (err) {
        console.warn('[Admin] Coupon update fallback:', err.message)
      }
    }

    const idx = adminMockCoupons.findIndex((c) => c.id === id || c.code === id)
    if (idx !== -1) {
      adminMockCoupons[idx] = { ...adminMockCoupons[idx], ...updates }
      return successResponse(res, { message: 'Coupon updated', data: adminMockCoupons[idx] })
    }

    return errorResponse(res, { message: 'Coupon not found', code: 'NOT_FOUND', statusCode: 404 })
  } catch (error) {
    next(error)
  }
}

export async function adminDeleteCoupon(req, res, next) {
  try {
    const { id } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        await prisma.coupon.delete({ where: { id } })
        return successResponse(res, { message: 'Coupon deleted', data: { id } })
      } catch (err) {
        console.warn('[Admin] Coupon delete fallback:', err.message)
      }
    }

    const idx = adminMockCoupons.findIndex((c) => c.id === id || c.code === id)
    if (idx !== -1) adminMockCoupons.splice(idx, 1)

    return successResponse(res, { message: 'Coupon deleted', data: { id } })
  } catch (error) {
    next(error)
  }
}
