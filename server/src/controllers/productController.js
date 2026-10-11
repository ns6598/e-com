import productService from '../services/productService.js'
import { successResponse, errorResponse } from '../utils/response.js'

/**
 * Get all products with optional filters, search, and sorting
 * Endpoint: GET /api/products
 */
export async function getProducts(req, res, next) {
  try {
    const { department, category, search, featured, isNew, sort, minPrice, maxPrice } = req.query

    const result = await productService.list({
      department,
      category,
      search,
      featured,
      isNew,
      sort,
      minPrice,
      maxPrice,
    })

    return successResponse(res, {
      message: `Retrieved ${result.total} silhouettes`,
      data: result.items,
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
    const result = await productService.getById(id)

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
 * Get departments and categories taxonomy
 * Endpoint: GET /api/products/meta/categories
 */
export function getProductTaxonomy(req, res) {
  const taxonomy = productService.getCategories()
  return successResponse(res, {
    message: 'Product taxonomy retrieved successfully',
    data: taxonomy,
  })
}
