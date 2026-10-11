import api from './api'

/**
 * AUREVA Atelier Product Service
 * Connects directly to the Express REST API and PostgreSQL database.
 */
export const productService = {
  /**
   * Fetch paginated products with server-side filtering, sorting and search
   * @param {Object} params - Query parameters (page, limit, department, category, search, size, color, minPrice, maxPrice, isSale, isNew, sort)
   * @returns {Promise<{ items: Array, pagination: Object }>}
   */
  getProducts: async (params = {}) => {
    const cleanParams = {}
    Object.keys(params).forEach((key) => {
      const val = params[key]
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        cleanParams[key] = val
      }
    })

    const response = await api.get('/products', { params: cleanParams })
    if (response && response.success && response.data) {
      return {
        items: response.data.items || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: cleanParams.limit || 12,
          total: response.data.items?.length || 0,
          totalPages: 1,
          hasMore: false,
        },
      }
    }
    throw new Error(response?.message || 'Failed to retrieve catalog products')
  },

  /**
   * Alias for backwards compatibility with earlier components
   */
  getAll: async (params = {}) => {
    const result = await productService.getProducts(params)
    return result.items
  },

  /**
   * Fetch single product by its unique UUID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getProductById: async (id) => {
    const response = await api.get(`/products/${encodeURIComponent(id)}`)
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || `Product ${id} not found`)
  },

  /**
   * Fetch single product by unique slug
   * @param {string} slug
   * @returns {Promise<Object>}
   */
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${encodeURIComponent(slug)}`)
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || `Product '${slug}' not found`)
  },

  /**
   * Flexible lookup supporting both ID and slug parameters
   * @param {string} identifier
   * @returns {Promise<Object>}
   */
  getByIdOrSlug: async (identifier) => {
    if (!identifier) throw new Error('Product identifier is required')

    // Check if looks like a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
    if (isUuid) {
      try {
        return await productService.getProductById(identifier)
      } catch (err) {
        return await productService.getProductBySlug(identifier)
      }
    } else {
      try {
        return await productService.getProductBySlug(identifier)
      } catch (err) {
        return await productService.getProductById(identifier)
      }
    }
  },
}

export default productService
