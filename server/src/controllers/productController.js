import productService from '../services/productService.js'
import { successResponse, errorResponse } from '../utils/response.js'

/**
 * Get all products with pagination, search, category, size, color, price range, and sorting
 * Endpoint: GET /api/products
 */
export async function getProducts(req, res, next) {
  try {
    const {
      page,
      limit,
      department,
      category,
      search,
      size,
      color,
      minPrice,
      maxPrice,
      isSale,
      featured,
      isNew,
      sort,
    } = req.query

    const result = await productService.list({
      page,
      limit,
      department,
      category,
      search,
      size,
      color,
      minPrice,
      maxPrice,
      isSale,
      featured,
      isNew,
      sort,
      includeInactive: false, // Public endpoint only returns active products
    })

    return successResponse(res, {
      message: `Retrieved ${result.items.length} silhouettes (total: ${result.total})`,
      data: {
        items: result.items,
        pagination: result.pagination,
      },
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
    const result = await productService.getById(id, false)

    if (!result.product) {
      return errorResponse(res, {
        message: `Product '${id}' not found in active repertoire`,
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Product retrieved successfully',
      data: result.product,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single product by Slug
 * Endpoint: GET /api/products/slug/:slug
 */
export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params
    const result = await productService.getBySlug(slug, false)

    if (!result.product) {
      return errorResponse(res, {
        message: `Product with slug '${slug}' not found in active repertoire`,
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Product retrieved successfully',
      data: result.product,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get categories list
 * Endpoint: GET /api/categories
 */
export async function getCategories(req, res, next) {
  try {
    const taxonomy = await productService.getCategories()
    return successResponse(res, {
      message: 'Categories retrieved successfully',
      data: taxonomy.categories,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get departments and categories taxonomy
 * Endpoint: GET /api/products/meta/categories
 */
export async function getProductTaxonomy(req, res, next) {
  try {
    const taxonomy = await productService.getCategories()
    return successResponse(res, {
      message: 'Product taxonomy retrieved successfully',
      data: taxonomy,
    })
  } catch (error) {
    next(error)
  }
}
