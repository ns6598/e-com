import api from './api'
import { PRODUCTS } from '../data/products'

/**
 * AUREVA Category Service
 * Retrieves category and department taxonomy from PostgreSQL with client fallback
 */
export const categoryService = {
  /**
   * Get all active product categories
   * @returns {Promise<Array>}
   */
  getCategories: async () => {
    try {
      const response = await api.get('/categories')
      if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data
      }
    } catch (err) {
      console.warn('[categoryService] Backend API note; using client taxonomy fallback:', err.message)
    }

    // Client-side fallback categories derived from centralized catalog
    const unique = Array.from(new Set(PRODUCTS.map((p) => p.category).filter(Boolean)))
    return unique.map((name, i) => ({
      id: `cat-${i + 1}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: PRODUCTS.filter((p) => p.category === name).length,
    }))
  },

  /**
   * Get full taxonomy including departments and categories
   * @returns {Promise<{ categories: Array, departments: Array }>}
   */
  getTaxonomy: async () => {
    try {
      const response = await api.get('/products/meta/categories')
      if (response && response.success && response.data) {
        return response.data
      }
    } catch (err) {
      console.warn('[categoryService] getTaxonomy API note; using fallback:', err.message)
    }

    const uniqueCategories = Array.from(new Set(PRODUCTS.map((p) => p.category).filter(Boolean)))
    const uniqueDepts = Array.from(new Set(PRODUCTS.map((p) => p.department).filter(Boolean)))

    return {
      departments: uniqueDepts.length > 0 ? uniqueDepts : ['Women', 'Men', 'Unisex'],
      categories: uniqueCategories.map((name, i) => ({
        id: `cat-${i + 1}`,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })),
    }
  },
}

export default categoryService
