import api from './api'
import { PRODUCTS } from '../data/products'

/**
 * Product Service with graceful fallback to catalog data
 * if the backend database is still undergoing provisioning.
 */
export const productService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/products', { params })
      if (response && response.success && Array.isArray(response.data)) {
        return response.data
      }
      return PRODUCTS
    } catch {
      // Graceful offline/local fallback to static catalog
      return PRODUCTS
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      if (response && response.success && response.data) {
        return response.data
      }
      return PRODUCTS.find((p) => p.id === id) || null
    } catch {
      return PRODUCTS.find((p) => p.id === id) || null
    }
  },
}

export default productService
