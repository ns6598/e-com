import api from './api'

/**
 * AUREVA Wishlist Service
 * Communicates with backend wishlist endpoints backed by PostgreSQL Wishlist & WishlistItem models.
 */
export const wishlistService = {
  /**
   * Fetch authenticated customer's wishlist
   * @returns {Promise<Object>} Wishlist with items
   */
  getWishlist: async () => {
    try {
      const response = await api.get('/wishlist')
      if (response && response.success && response.data) {
        return response.data
      }
      return { id: null, items: [] }
    } catch {
      return { id: null, items: [] }
    }
  },

  /**
   * Add product to wishlist
   * @param {string} productId
   */
  addItem: async (productId) => {
    const response = await api.post('/wishlist/items', { productId })
    if (response && response.success) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to save silhouette to wishlist')
  },

  /**
   * Remove product from wishlist
   * @param {string} productId
   */
  removeItem: async (productId) => {
    const response = await api.delete(`/wishlist/items/${encodeURIComponent(productId)}`)
    if (response && response.success) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to remove silhouette from wishlist')
  },

  /**
   * Toggle product in wishlist
   * @param {string} productId
   * @returns {Promise<{ inWishlist: boolean }>}
   */
  toggleItem: async (productId) => {
    const response = await api.post('/wishlist/toggle', { productId })
    if (response && response.success) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to toggle wishlist item')
  },
}

export default wishlistService
