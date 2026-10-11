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

/**
 * Admin: Create a new product
 * Endpoint: POST /api/products
 */
export async function createProduct(req, res, next) {
  try {
    const { name, price, department, category } = req.body
    if (!name || !price || !department || !category) {
      return errorResponse(res, {
        message: 'Name, price, department, and category are mandatory for new catalog silhouettes.',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      })
    }

    const result = await productService.create(req.body)
    return successResponse(res, {
      message: 'New silhouette successfully inducted into AUREVA repertoire',
      data: result.product,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update an existing product
 * Endpoint: PUT /api/products/:id
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const result = await productService.update(id, req.body)

    if (!result.product) {
      return errorResponse(res, {
        message: `Product reference '${id}' not found in active catalog`,
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Product silhouette updated successfully',
      data: result.product,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Delete a product
 * Endpoint: DELETE /api/products/:id
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params
    const result = await productService.delete(id)

    if (!result.success) {
      return errorResponse(res, {
        message: `Product reference '${id}' not found for decommissioning`,
        code: 'PRODUCT_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Product silhouette retired from atelier repertoire',
      data: { id },
    })
  } catch (error) {
    next(error)
  }
}

