import api from './api'

/**
 * AUREVA Category Service
 * Retrieves category and department taxonomy from PostgreSQL
 */
export const categoryService = {
  /**
   * Get all active product categories
   * @returns {Promise<Array>}
   */
  getCategories: async () => {
    const response = await api.get('/categories')
    if (response && response.success && Array.isArray(response.data)) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to load categories')
  },

  /**
   * Get full taxonomy including departments and categories
   * @returns {Promise<{ categories: Array, departments: Array }>}
   */
  getTaxonomy: async () => {
    const response = await api.get('/products/meta/categories')
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to load product taxonomy')
  },
}

export default categoryService
