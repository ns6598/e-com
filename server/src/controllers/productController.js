import { prisma, dbStatus } from '../config/db.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { PRODUCTS } from '../data/products.js'

/**
 * Get all products with optional filters
 * Endpoint: GET /api/products
 */
export async function getProducts(req, res, next) {
  try {
    const { department, category, search, featured, isNew } = req.query

    // 1. If database is connected, attempt Prisma query
    if (dbStatus.isConnected && prisma) {
      try {
        const where = {}
        if (department && department !== 'All') {
          where.department = { equals: department, mode: 'insensitive' }
        }
        if (category && category !== 'All') {
          where.category = { equals: category, mode: 'insensitive' }
        }
        if (featured === 'true') {
          where.isFeatured = true
        }
        if (isNew === 'true') {
          where.isNew = true
        }
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }

        const dbProducts = await prisma.product.findMany({ where })
        if (dbProducts && dbProducts.length > 0) {
          return successResponse(res, {
            message: 'Products retrieved from database',
            data: dbProducts,
          })
        }
      } catch (err) {
        console.warn('[Products Controller] Database query fallback:', err.message)
      }
    }

    // 2. Fallback to centralized catalog data
    let filtered = [...PRODUCTS]

    if (department && department !== 'All') {
      filtered = filtered.filter((p) => p.department.toLowerCase() === department.toLowerCase())
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    }
    if (featured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured)
    }
    if (isNew === 'true') {
      filtered = filtered.filter((p) => p.isNew)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    return successResponse(res, {
      message: 'Products retrieved successfully',
      data: filtered,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single product by ID
 * Endpoint: GET /api/products/:id
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        const product = await prisma.product.findUnique({
          where: { id },
        })
        if (product) {
          return successResponse(res, {
            message: 'Product retrieved from database',
            data: product,
          })
        }
      } catch (err) {
        console.warn('[Products Controller] Database query fallback:', err.message)
      }
    }

    const staticProduct = PRODUCTS.find((p) => p.id === id)
    if (!staticProduct) {
      return errorResponse(res, {
        message: `Product with ID '${id}' not found in repertoire`,
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Product retrieved successfully',
      data: staticProduct,
    })
  } catch (error) {
    next(error)
  }
}
