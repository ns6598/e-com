import api from './api'

/**
 * AUREVA Orders Service
 * Handles transactional order placement with idempotency and order retrieval.
 */
export const orderService = {
  /**
   * Submit an order to the backend
   * @param {Object} orderData
   * @param {string} [idempotencyKey]
   * @returns {Promise<Object>} Created order
   */
  createOrder: async (orderData, idempotencyKey) => {
    const headers = {}
    const key = idempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    headers['x-idempotency-key'] = key

    const payload = {
      ...orderData,
      idempotencyKey: key,
    }

    const response = await api.post('/orders', payload, { headers })
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || 'Order finalization failed')
  },

  /**
   * Fetch authenticated customer's past orders
   * @returns {Promise<Array>} List of orders
   */
  getOrders: async () => {
    const response = await api.get('/orders')
    if (response && response.success && Array.isArray(response.data)) {
      return response.data
    }
    return []
  },

  /**
   * Fetch a single order by ID or order number
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${encodeURIComponent(id)}`)
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || `Order ${id} not found`)
  },
}

export default orderService
