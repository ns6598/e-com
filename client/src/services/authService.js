import api from './api'

/**
 * AUREVA Authentication & Patron Profile Service
 */
export const authService = {
  /**
   * Log into patron account
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: Object, token: string }>}
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || 'Authentication failed')
  },

  /**
   * Register new patron account
   * @param {string} email
   * @param {string} password
   * @param {string} [name]
   * @returns {Promise<{ user: Object, token: string }>}
   */
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name })
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || 'Registration failed')
  },

  /**
   * Terminate active patron session
   */
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Even if network fails, client clears credentials
    }
  },

  /**
   * Fetch current authenticated patron profile
   * @returns {Promise<Object>}
   */
  getMe: async () => {
    const response = await api.get('/auth/me')
    if (response && response.success && response.data) {
      return response.data.user || response.data
    }
    throw new Error(response?.message || 'Session invalid')
  },

  /**
   * Update patron account profile preferences
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    if (response && response.success && response.data) {
      return response.data.user || response.data
    }
    throw new Error(response?.message || 'Failed to update preferences')
  },

  /**
   * Get customer saved delivery addresses
   * @returns {Promise<Array>}
   */
  getAddresses: async () => {
    const response = await api.get('/users/me/addresses')
    if (response && response.success && Array.isArray(response.data)) {
      return response.data
    }
    return []
  },

  /**
   * Create new saved address
   * @param {Object} addressData
   */
  createAddress: async (addressData) => {
    const response = await api.post('/users/me/addresses', addressData)
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to add address')
  },

  /**
   * Update existing saved address
   * @param {string} id
   * @param {Object} addressData
   */
  updateAddress: async (id, addressData) => {
    const response = await api.patch(`/users/me/addresses/${id}`, addressData)
    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || 'Failed to update address')
  },

  /**
   * Delete saved address
   * @param {string} id
   */
  deleteAddress: async (id) => {
    const response = await api.delete(`/users/me/addresses/${id}`)
    return response?.success
  },
}

export default authService
