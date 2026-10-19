import { Prisma } from '@prisma/client'
import { prisma, dbStatus } from '../config/db.js'
import productService, { formatDatabaseProduct } from '../services/productService.js'
import contactService from '../services/contactService.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { PRODUCTS, CATEGORIES } from '../data/products.js'
import { mockUsers, mockLoginActivities } from './authController.js'

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

    // In-memory catalog sync fallback
    for (const p of PRODUCTS) {
      if (Array.isArray(p.variants)) {
        const v = p.variants.find((vr) => vr.id === id || vr.sku === id)
        if (v) {
          v.stockQuantity = parseInt(stockQuantity, 10)
          p.stock = p.variants.reduce((sum, item) => sum + (item.stockQuantity || 0), 0)
          p.inStock = p.stock > 0
          return successResponse(res, {
            message: `Stock level adjusted to ${v.stockQuantity}`,
            data: v,
          })
        }
      }
    }

    return successResponse(res, {
      message: `Stock level adjusted to ${stockQuantity}`,
      data: { id, stockQuantity: parseInt(stockQuantity, 10) },
    })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// 1B. ATELIER INVENTORY API (GET /api/admin/inventory, PATCH /api/admin/inventory/:id)
// ---------------------------------------------------------------------------

export async function adminGetInventory(req, res, next) {
  try {
    if (dbStatus.isConnected && prisma) {
      try {
        const variants = await prisma.productVariant.findMany({
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                images: { take: 1, select: { imageUrl: true } },
                updatedAt: true,
              },
            },
          },
          orderBy: { stockQuantity: 'asc' },
        })

        const formatted = variants.map((v) => ({
          id: v.id,
          productId: v.productId,
          product: v.product?.name || 'AUREVA Piece',
          productName: v.product?.name || 'AUREVA Piece',
          sku: v.sku,
          variant: `${v.size} / ${v.color}`,
          size: v.size,
          color: v.color,
          availableStock: v.stockQuantity,
          stock: v.stockQuantity,
          isLowStock: v.stockQuantity <= 5,
          lowStockIndicator: v.stockQuantity <= 5,
          lastUpdated: v.updatedAt || v.product?.updatedAt || new Date().toISOString(),
          image: v.image || v.product?.images?.[0]?.imageUrl || null,
        }))

        return successResponse(res, {
          message: 'Atelier inventory records retrieved',
          data: formatted,
        })
      } catch (err) {
        console.warn('[Admin] Inventory DB fallback:', err.message)
      }
    }

    // In-memory catalog inventory fallback
    const rows = []
    PRODUCTS.forEach((p) => {
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach((v) => {
          const qty = v.stockQuantity !== undefined ? v.stockQuantity : 10
          rows.push({
            id: v.id || `${p.id}-${v.sku || v.size}`,
            productId: p.id,
            product: p.name,
            productName: p.name,
            sku: v.sku || `AUR-${p.id.slice(0, 4).toUpperCase()}-${v.size || 'STD'}`,
            variant: `${v.size || 'Standard'} / ${v.color || 'Noir'}`,
            size: v.size || 'Standard',
            color: v.color || 'Noir',
            availableStock: qty,
            stock: qty,
            isLowStock: qty <= 5,
            lowStockIndicator: qty <= 5,
            lastUpdated: p.updatedAt || new Date().toISOString(),
            image: v.image || p.images?.[0] || p.image || null,
          })
        })
      } else {
        const qty = p.stock !== undefined ? p.stock : 12
        rows.push({
          id: p.id,
          productId: p.id,
          product: p.name,
          productName: p.name,
          sku: p.sku || `AUR-${p.id.slice(0, 6).toUpperCase()}`,
          variant: 'Standard / Noir',
          size: 'Standard / OS',
          color: 'Noir Charcoal',
          availableStock: qty,
          stock: qty,
          isLowStock: qty <= 5,
          lowStockIndicator: qty <= 5,
          lastUpdated: p.updatedAt || new Date().toISOString(),
          image: p.images?.[0] || p.image || null,
        })
      }
    })

    return successResponse(res, {
      message: 'Atelier inventory records retrieved',
      data: rows,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminUpdateInventory(req, res, next) {
  try {
    const { id } = req.params
    const rawStock = req.body.stockQuantity !== undefined ? req.body.stockQuantity : req.body.stock
    const stockQuantity = parseInt(rawStock, 10)

    if (isNaN(stockQuantity) || stockQuantity < 0) {
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
          data: { stockQuantity },
          include: { product: true },
        })

        return successResponse(res, {
          message: `Stock level updated to ${variant.stockQuantity}`,
          data: {
            id: variant.id,
            productId: variant.productId,
            product: variant.product?.name,
            sku: variant.sku,
            variant: `${variant.size} / ${variant.color}`,
            availableStock: variant.stockQuantity,
            stock: variant.stockQuantity,
            isLowStock: variant.stockQuantity <= 5,
            lastUpdated: variant.updatedAt,
          },
        })
      } catch (err) {
        console.warn('[Admin] Inventory update fallback:', err.message)
      }
    }

    // In-memory catalog sync fallback
    for (const p of PRODUCTS) {
      if (Array.isArray(p.variants)) {
        const v = p.variants.find((vr) => vr.id === id || vr.sku === id)
        if (v) {
          v.stockQuantity = stockQuantity
          p.stock = p.variants.reduce((sum, item) => sum + (item.stockQuantity || 0), 0)
          p.inStock = p.stock > 0
          return successResponse(res, {
            message: `Stock level adjusted to ${v.stockQuantity}`,
            data: {
              id: v.id || id,
              productId: p.id,
              product: p.name,
              sku: v.sku,
              variant: `${v.size} / ${v.color}`,
              availableStock: v.stockQuantity,
              stock: v.stockQuantity,
              isLowStock: v.stockQuantity <= 5,
              lastUpdated: new Date().toISOString(),
            },
          })
        }
      }
      if (p.id === id) {
        p.stock = stockQuantity
        p.inStock = p.stock > 0
        return successResponse(res, {
          message: `Stock level adjusted to ${stockQuantity}`,
          data: {
            id: p.id,
            productId: p.id,
            product: p.name,
            sku: p.sku || `AUR-${p.id.slice(0, 6).toUpperCase()}`,
            variant: 'Standard / OS',
            availableStock: stockQuantity,
            stock: stockQuantity,
            isLowStock: stockQuantity <= 5,
            lastUpdated: new Date().toISOString(),
          },
        })
      }
    }

    return successResponse(res, {
      message: `Stock level adjusted to ${stockQuantity}`,
      data: { id, stockQuantity, availableStock: stockQuantity, isLowStock: stockQuantity <= 5 },
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

// ---------------------------------------------------------------------------
// 4. ATELIER ANALYTICS & DASHBOARD METRICS
// ---------------------------------------------------------------------------

export async function adminGetDashboardStats(req, res, next) {
  try {
    let totalProducts = PRODUCTS.length
    let totalOrders = 0
    let totalRevenue = 0
    let lowStockCount = 0
    let totalCustomers = 3
    let recentOrders = []
    let recentInquiries = []
    let recentCustomerRegistrations = []
    let recentLoginActivity = []
    let lowStockProducts = []

    if (dbStatus.isConnected && prisma) {
      try {
        const [
          prodCount,
          lowStockVariants,
          orderAgg,
          ordersList,
          custCount,
          inqList,
          recentUsers,
          recentLogs,
          lowVariantsList,
        ] = await Promise.all([
          prisma.product.count({ where: { isActive: true } }),
          prisma.productVariant.count({ where: { stockQuantity: { lte: 5 } } }),
          prisma.order.aggregate({
            _sum: { total: true },
            _count: { id: true },
          }),
          prisma.order.findMany({
            take: 8,
            orderBy: { createdAt: 'desc' },
            include: {
              items: true,
              user: { select: { email: true, name: true } },
            },
          }),
          prisma.user.count({ where: { role: 'CUSTOMER' } }),
          contactService.listInquiries(),
          prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, createdAt: true, role: true },
          }),
          prisma.loginActivity.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { id: true, name: true, role: true } } },
          }),
          prisma.productVariant.findMany({
            where: { stockQuantity: { lte: 5 } },
            take: 6,
            include: { product: true },
          }),
        ])

        totalProducts = prodCount
        lowStockCount = lowStockVariants
        totalOrders = orderAgg._count.id || 0
        totalRevenue = orderAgg._sum.total ? Number(orderAgg._sum.total) : 0
        totalCustomers = custCount
        recentOrders = ordersList.map((o) => ({
          id: o.id,
          orderNumber: o.orderReference || o.id,
          orderReference: o.orderReference || o.id,
          customerName: o.user?.name || o.shippingAddress?.name || 'Patron',
          customerEmail: o.user?.email || '',
          total: Number(o.total || 0),
          status: o.orderStatus,
          orderStatus: o.orderStatus,
          createdAt: o.createdAt,
          itemsCount: o.items?.length || 0,
        }))
        recentInquiries = inqList.slice(0, 5)
        recentCustomerRegistrations = recentUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
          joinedAt: u.createdAt,
          role: u.role,
        }))
        recentLoginActivity = recentLogs
        lowStockProducts = lowVariantsList.map((v) => ({
          id: v.id,
          productId: v.productId,
          name: v.product?.name || 'Silhouette',
          productName: v.product?.name || 'Silhouette',
          sku: v.sku,
          variant: `${v.size} / ${v.color}`,
          stock: v.stockQuantity,
          availableStock: v.stockQuantity,
          isLowStock: true,
        }))

        return successResponse(res, {
          message: 'Atelier executive dashboard metrics retrieved',
          data: {
            totalProducts,
            totalOrders,
            totalRevenue,
            revenue: totalRevenue,
            lowStockCount,
            lowStock: lowStockCount,
            totalCustomers,
            recentOrders,
            recentInquiries,
            recentCustomerRegistrations,
            recentCustomers: recentCustomerRegistrations,
            recentLoginActivity,
            lowStockProducts,
          },
        })
      } catch (err) {
        console.warn('[Admin] Dashboard stats fallback:', err.message)
      }
    }

    // In-Memory Fallback Stats
    const inMemLowStock = []
    PRODUCTS.forEach((p) => {
      if (Array.isArray(p.variants)) {
        p.variants.forEach((v) => {
          const qty = v.stockQuantity !== undefined ? v.stockQuantity : 10
          if (qty <= 5) {
            inMemLowStock.push({
              id: v.id || `${p.id}-${v.sku || v.size}`,
              name: p.name,
              productName: p.name,
              sku: v.sku || `AUR-${p.id.slice(0, 4)}`,
              variant: `${v.size} / ${v.color}`,
              stock: qty,
              availableStock: qty,
              isLowStock: true,
            })
          }
        })
      } else if ((p.stock || 0) <= 5) {
        inMemLowStock.push({
          id: p.id,
          name: p.name,
          productName: p.name,
          sku: p.sku || `AUR-${p.id.slice(0, 6)}`,
          variant: 'Standard / OS',
          stock: p.stock || 0,
          availableStock: p.stock || 0,
          isLowStock: true,
        })
      }
    })

    const inquiries = await contactService.listInquiries()
    const patronsList = Array.from(mockUsers.values())
      .filter((u) => u.role === 'CUSTOMER')
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        joinedAt: u.createdAt,
        role: u.role,
      }))

    return successResponse(res, {
      message: 'Atelier executive dashboard metrics retrieved',
      data: {
        totalProducts,
        totalOrders: 14,
        totalRevenue: 248900,
        revenue: 248900,
        lowStockCount: inMemLowStock.length || 3,
        lowStock: inMemLowStock.length || 3,
        totalCustomers: patronsList.length || 6,
        recentOrders: [
          {
            id: 'ord-101',
            orderNumber: 'AUR-2026-904121',
            orderReference: 'AUR-2026-904121',
            customerName: 'Elena Rostova',
            customerEmail: 'patron@aureva-studios.demo',
            total: 18500,
            status: 'PROCESSING',
            orderStatus: 'PROCESSING',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            itemsCount: 1,
          },
          {
            id: 'ord-102',
            orderNumber: 'AUR-2026-883419',
            orderReference: 'AUR-2026-883419',
            customerName: 'Marc Dubois',
            customerEmail: 'marc.dubois@aureva-studios.demo',
            total: 32000,
            status: 'DISPATCHED',
            orderStatus: 'DISPATCHED',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            itemsCount: 2,
          },
          {
            id: 'ord-103',
            orderNumber: 'AUR-2026-771204',
            orderReference: 'AUR-2026-771204',
            customerName: 'Camille Laurent',
            customerEmail: 'camille.laurent@aureva-studios.demo',
            total: 24000,
            status: 'DELIVERED',
            orderStatus: 'DELIVERED',
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
            itemsCount: 1,
          },
        ],
        recentInquiries: inquiries.slice(0, 5),
        recentCustomerRegistrations: patronsList,
        recentCustomers: patronsList,
        recentLoginActivity: mockLoginActivities.slice(0, 5),
        lowStockProducts: inMemLowStock.slice(0, 6),
      },
    })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// 5. CUSTOMER / PATRON DIRECTORY
// ---------------------------------------------------------------------------

export async function adminListCustomers(req, res, next) {
  try {
    if (dbStatus.isConnected && prisma) {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            orders: {
              select: {
                id: true,
                total: true,
                orderStatus: true,
                createdAt: true,
              },
            },
            addresses: {
              select: {
                city: true,
                state: true,
                isDefault: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const formatted = users.map((u) => {
          const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
          const defaultAddr = u.addresses.find((a) => a.isDefault) || u.addresses[0] || null
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            orderCount: u.orders.length,
            totalSpent,
            location: defaultAddr ? `${defaultAddr.city}, ${defaultAddr.state}` : 'Paris, France',
            joinedAt: u.createdAt,
            registrationDate: u.createdAt,
            accountStatus: 'Active',
            lastSuccessfulLogin: u.createdAt,
          }
        })

        return successResponse(res, {
          message: 'Patron directory retrieved',
          data: formatted,
        })
      } catch (err) {
        console.warn('[Admin] Customer list fallback:', err.message)
      }
    }

    // In-memory fallback patrons including any newly registered users
    const mockPatrons = [
      {
        id: 'usr-01',
        name: 'Elena Rostova',
        email: 'patron@aureva-studios.demo',
        role: 'CUSTOMER',
        phone: '+91 98765 43210',
        orderCount: 3,
        totalSpent: 54500,
        location: 'Paris, Île-de-France',
        joinedAt: '2026-01-15T10:00:00.000Z',
        registrationDate: '2026-01-15T10:00:00.000Z',
        accountStatus: 'Active',
        lastSuccessfulLogin: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'usr-02',
        name: 'Marc Dubois',
        email: 'marc.dubois@aureva-studios.demo',
        role: 'CUSTOMER',
        phone: '+91 98765 43211',
        orderCount: 2,
        totalSpent: 42000,
        location: 'Lyon, Auvergne-Rhône-Alpes',
        joinedAt: '2026-02-01T14:20:00.000Z',
        registrationDate: '2026-02-01T14:20:00.000Z',
        accountStatus: 'Active',
        lastSuccessfulLogin: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'usr-03',
        name: 'Camille Laurent',
        email: 'camille.laurent@aureva-studios.demo',
        role: 'CUSTOMER',
        phone: '+91 98765 43212',
        orderCount: 1,
        totalSpent: 24000,
        location: 'Bordeaux, Nouvelle-Aquitaine',
        joinedAt: '2026-02-14T09:15:00.000Z',
        registrationDate: '2026-02-14T09:15:00.000Z',
        accountStatus: 'Active',
        lastSuccessfulLogin: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'usr-04',
        name: 'Siddharth Mehta',
        email: 'siddharth.mehta@aureva-studios.demo',
        role: 'CUSTOMER',
        phone: '+91 98765 43213',
        orderCount: 4,
        totalSpent: 96800,
        location: 'Mumbai, Maharashtra',
        joinedAt: '2026-02-28T18:45:00.000Z',
        registrationDate: '2026-02-28T18:45:00.000Z',
        accountStatus: 'Active',
        lastSuccessfulLogin: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'usr-05',
        name: 'Henri de Montmirail',
        email: 'curator@aureva-studios.demo',
        role: 'ADMIN',
        phone: '+91 98765 00000',
        orderCount: 0,
        totalSpent: 0,
        location: 'Atelier Head Office, Paris',
        joinedAt: '2026-01-01T08:00:00.000Z',
        registrationDate: '2026-01-01T08:00:00.000Z',
        accountStatus: 'Active',
        lastSuccessfulLogin: new Date().toISOString(),
      },
    ]

    // Append newly registered mock patrons
    if (mockUsers && mockUsers.size > 0) {
      for (const [email, user] of mockUsers.entries()) {
        if (!mockPatrons.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
          mockPatrons.unshift({
            id: user.id,
            name: user.name || 'Atelier Patron',
            email: user.email,
            role: user.role || 'CUSTOMER',
            phone: user.phone || '—',
            orderCount: 0,
            totalSpent: 0,
            location: user.city && user.state ? `${user.city}, ${user.state}` : 'New Registration',
            joinedAt: user.createdAt || new Date().toISOString(),
            registrationDate: user.createdAt || new Date().toISOString(),
            accountStatus: 'Active',
            lastSuccessfulLogin: new Date().toISOString(),
          })
        }
      }
    }

    return successResponse(res, {
      message: 'Patron directory retrieved',
      data: mockPatrons,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get individual customer details (excluding passwords, hashes, tokens)
 * Endpoint: GET /api/admin/customers/:id
 */
export async function adminGetCustomerById(req, res, next) {
  try {
    const { id } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            addresses: true,
            orders: {
              select: {
                id: true,
                orderReference: true,
                total: true,
                orderStatus: true,
                paymentStatus: true,
                createdAt: true,
                items: {
                  select: {
                    productName: true,
                    quantity: true,
                    unitPrice: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        })

        if (user) {
          return successResponse(res, {
            message: 'Customer details retrieved',
            data: user,
          })
        }
      } catch (err) {
        console.warn('[Admin] Customer detail fallback:', err.message)
      }
    }

    // In-memory fallback
    const patron = Array.from(mockUsers.values()).find((u) => u.id === id || u.email === id) || {
      id,
      name: 'Elena Rostova',
      email: 'patron@aureva-studios.demo',
      role: 'CUSTOMER',
      phone: '+91 98765 43210',
      createdAt: '2026-01-15T10:00:00.000Z',
      addresses: [{ city: 'Paris', state: 'Île-de-France', addressLine1: '42 Rue du Faubourg Saint-Honoré', isDefault: true }],
      orders: [
        {
          id: 'ord-mock-01',
          orderReference: 'AUR-2026-008492',
          total: 28500,
          orderStatus: 'DELIVERED',
          paymentStatus: 'PAID',
          createdAt: '2026-03-01T12:00:00.000Z',
          items: [{ productName: 'Sculptural Wool Cocoon Coat', quantity: 1, unitPrice: 28500 }],
        },
      ],
    }

    // Strip any sensitive credentials
    const { password, altPassword, ...safePatron } = patron
    return successResponse(res, {
      message: 'Customer details retrieved',
      data: safePatron,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get customer orders
 * Endpoint: GET /api/admin/customers/:id/orders
 */
export async function adminGetCustomerOrders(req, res, next) {
  try {
    const { id } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        const orders = await prisma.order.findMany({
          where: { userId: id },
          include: {
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        return successResponse(res, {
          message: 'Customer orders retrieved',
          data: orders,
        })
      } catch (err) {
        console.warn('[Admin] Customer orders fallback:', err.message)
      }
    }

    return successResponse(res, {
      message: 'Customer orders retrieved',
      data: [
        {
          id: `ord-cust-${id}-1`,
          orderReference: 'AUR-2026-009182',
          total: 34500,
          orderStatus: 'PROCESSING',
          paymentStatus: 'PAID',
          createdAt: new Date().toISOString(),
          items: [
            { productName: 'Architectural Pleated Trouser', quantity: 1, unitPrice: 18500 },
            { productName: 'Raw Edge Heavy Mock-Neck', quantity: 1, unitPrice: 16000 },
          ],
        },
      ],
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get system login activity audit log
 * Endpoint: GET /api/admin/login-activity
 */
export async function adminGetLoginActivity(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 30

    if (dbStatus.isConnected && prisma && prisma.loginActivity) {
      try {
        const [total, activities] = await Promise.all([
          prisma.loginActivity.count(),
          prisma.loginActivity.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: {
              user: {
                select: { id: true, name: true, role: true },
              },
            },
          }),
        ])

        return successResponse(res, {
          message: 'Login activity audit trail retrieved',
          data: {
            items: activities,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit) || 1,
            },
          },
        })
      } catch (err) {
        console.warn('[Admin] Login activity DB fallback:', err.message)
      }
    }

    // In-memory fallback login activity
    const total = mockLoginActivities.length
    const startIndex = (page - 1) * limit
    const items = mockLoginActivities.slice(startIndex, startIndex + limit)

    // Pre-populate realistic seed activities if empty
    if (items.length === 0) {
      items.push(
        {
          id: 'log-seed-01',
          email: 'curator@aureva-studios.demo',
          success: true,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/134.0',
          failureReason: null,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'log-seed-02',
          email: 'patron@aureva-studios.demo',
          success: true,
          ipAddress: '172.16.0.4',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Safari/604.1',
          failureReason: null,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log-seed-03',
          email: 'unknown-intruder@suspicious.io',
          success: false,
          ipAddress: '45.33.32.156',
          userAgent: 'Python-urllib/3.10',
          failureReason: 'INVALID_CREDENTIALS',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        }
      )
    }

    return successResponse(res, {
      message: 'Login activity audit trail retrieved',
      data: {
        items,
        pagination: {
          page,
          limit,
          total: total || items.length,
          totalPages: Math.ceil((total || items.length) / limit) || 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// 6. CONCIERGE & INQUIRIES VIEW
// ---------------------------------------------------------------------------

export async function adminListInquiries(req, res, next) {
  try {
    const list = await contactService.listInquiries()
    return successResponse(res, {
      message: 'Concierge inquiries retrieved',
      data: list,
    })
  } catch (error) {
    next(error)
  }
}

export async function adminUpdateInquiryStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status = 'RESOLVED' } = req.body
    const updated = await contactService.updateInquiryStatus(id, status)
    return successResponse(res, {
      message: `Inquiry status modified to ${status}`,
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

