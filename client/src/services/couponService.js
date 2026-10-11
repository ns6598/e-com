import api from './api'

/**
 * AUREVA Coupon Validation Service
 */
export const couponService = {
  /**
   * Validate coupon code against order subtotal
   * @param {string} code - Privilege code (e.g. AUREVA10, WELCOME15)
   * @param {number} subtotal - Current shopping cart subtotal
   * @returns {Promise<{ valid: boolean, coupon: Object, discountAmount: number, finalTotal: number }>}
   */
  validateCoupon: async (code, subtotal = 0) => {
    if (!code || typeof code !== 'string') {
      throw new Error('Please enter a privilege code.')
    }

    const response = await api.post('/coupons/validate', {
      code: code.trim().toUpperCase(),
      subtotal: Math.max(0, Number(subtotal) || 0),
    })

    if (response && response.success && response.data) {
      return response.data
    }
    throw new Error(response?.message || 'Invalid privilege code')
  },
}

export default couponService
