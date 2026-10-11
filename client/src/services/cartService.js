import api from './api'

/**
 * AUREVA Shopping Cart Service
 * Communicates with backend cart endpoints backed by PostgreSQL Cart & CartItem models.
 */
export const cartService = {
  /**
   * Fetch customer or guest cart from backend
   * @returns {Promise<Object>} Cart with items array
   */
  getCart: async () => {
    const response = await api.get('/cart')
    if (response && response.success && response.data) {
      return response.data
    }
    return { id: null, items: [] }
  },

  /**
   * Add variant to shopping bag
   * @param {string} variantId
   * @param {number} quantity
   * @returns {Promise<Object>} Cart item
   */
  addItem: async (variantId, quantity = 1) => {
    const response = await api.post('/cart/items', { variantId, quantity })
    if (response && response.success) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to add item to bag')
  },

  /**
   * Update item quantity in shopping bag
   * @param {string} itemId
   * @param {number} quantity
   * @returns {Promise<Object>} Updated item
   */
  updateItem: async (itemId, quantity) => {
    const response = await api.patch(`/cart/items/${encodeURIComponent(itemId)}`, { quantity })
    if (response && response.success) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to update item quantity')
  },

  /**
   * Remove item from bag
   * @param {string} itemId
   * @returns {Promise<Object>}
   */
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${encodeURIComponent(itemId)}`)
    if (response && response.success) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to remove item from bag')
  },
}

export default cartService
