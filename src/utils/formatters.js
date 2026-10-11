/**
 * AUREVA Utilities & Formatters
 */

/**
 * Format currency in Indian Rupees (₹) with editorial precision
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate dynamic discount percentage from actual prices
 * @param {number} currentPrice
 * @param {number} originalPrice
 * @returns {number}
 */
export const calculateDiscountPercentage = (currentPrice, originalPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

/**
 * Capitalize or format slug strings
 * @param {string} str
 * @returns {string}
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
