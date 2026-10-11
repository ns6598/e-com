/**
 * AUREVA Privilege Coupon & Promotional Discount Service
 */

const VALID_COUPONS = [
  {
    code: 'AUREVA15',
    type: 'percentage',
    value: 15,
    minPurchase: 0,
    description: '15% Courtesy Privilege on Inaugural Salon Orders',
  },
  {
    code: 'VIP20',
    type: 'percentage',
    value: 20,
    minPurchase: 4000,
    description: '20% VIP Salon Monograph Privilege (Min ₹4,000)',
  },
  {
    code: 'ATELIER10',
    type: 'percentage',
    value: 10,
    minPurchase: 0,
    description: '10% Welcome Courtesy on Ready-to-Wear',
  },
]

export const couponService = {
  validate(code, subtotal = 0) {
    if (!code || typeof code !== 'string') {
      return { valid: false, message: 'Please provide a promo code.' }
    }

    const cleanCode = code.trim().toUpperCase()
    const coupon = VALID_COUPONS.find((c) => c.code === cleanCode)

    if (!coupon) {
      return {
        valid: false,
        message: `Privilege code '${cleanCode}' is invalid or expired.`,
      }
    }

    if (subtotal < coupon.minPurchase) {
      return {
        valid: false,
        message: `Code '${cleanCode}' requires a minimum allocation of ₹${coupon.minPurchase.toLocaleString('en-IN')}.`,
      }
    }

    let discountAmount = 0
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.value) / 100)
    }

    return {
      valid: true,
      code: coupon.code,
      discount: discountAmount,
      percentage: coupon.value,
      description: coupon.description,
      message: `${coupon.description} applied (-₹${discountAmount.toLocaleString('en-IN')}).`,
    }
  },
}

export default couponService
