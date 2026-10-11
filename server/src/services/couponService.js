import { Prisma } from '@prisma/client'
import { prisma, dbStatus } from '../config/db.js'

/**
 * AUREVA Privilege Coupon & Promotional Discount Service
 * Supports Prisma relational DB with Decimal monetary calculations,
 * and maintains fallback for development.
 */

const FALLBACK_COUPONS = [
  {
    code: 'AUREVA15',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 0,
    description: '15% Courtesy Privilege on Inaugural Salon Orders',
  },
  {
    code: 'VIP20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 4000,
    description: '20% VIP Salon Monograph Privilege (Min ₹4,000)',
  },
  {
    code: 'ATELIER10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 0,
    description: '10% Welcome Courtesy on Ready-to-Wear',
  },
  {
    code: 'PRIVILEGE500',
    discountType: 'FIXED_AMOUNT',
    discountValue: 500,
    minOrderValue: 3000,
    description: '₹500 Atelier Courtesy Privilege (Min ₹3,000)',
  },
]

export const couponService = {
  async validate(code, subtotal = 0) {
    if (!code || typeof code !== 'string') {
      return { valid: false, message: 'Please provide a promo code.' }
    }

    const cleanCode = code.trim().toUpperCase()
    const subtotalDec = new Prisma.Decimal(subtotal || 0)

    // 1. Try relational PostgreSQL database
    if (dbStatus.isConnected && prisma) {
      try {
        const coupon = await prisma.coupon.findUnique({
          where: { code: cleanCode },
        })

        if (!coupon || !coupon.isActive) {
          return {
            valid: false,
            message: `Privilege code '${cleanCode}' is invalid or deactivated.`,
          }
        }

        // Check date range
        const now = new Date()
        if (coupon.startDate && now < coupon.startDate) {
          return {
            valid: false,
            message: `Privilege code '${cleanCode}' is not yet active.`,
          }
        }
        if (coupon.expiryDate && now > coupon.expiryDate) {
          return {
            valid: false,
            message: `Privilege code '${cleanCode}' has expired.`,
          }
        }

        // Check usage limits
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return {
            valid: false,
            message: `Privilege code '${cleanCode}' has reached its allocation limit.`,
          }
        }

        // Check minimum order value using Prisma.Decimal
        if (coupon.minOrderValue && subtotalDec.lessThan(coupon.minOrderValue)) {
          return {
            valid: false,
            message: `Code '${cleanCode}' requires a minimum order of ₹${Number(coupon.minOrderValue).toLocaleString('en-IN')}.`,
          }
        }

        // Calculate discount with Decimal precision
        let discountDec = new Prisma.Decimal(0)
        if (coupon.discountType === 'PERCENTAGE') {
          discountDec = subtotalDec.mul(coupon.discountValue).dividedBy(100).toDecimalPlaces(2)
        } else {
          discountDec = Prisma.Decimal.min(subtotalDec, coupon.discountValue)
        }

        const discountNum = Number(discountDec)

        return {
          valid: true,
          code: coupon.code,
          discount: discountNum,
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          percentage: coupon.discountType === 'PERCENTAGE' ? Number(coupon.discountValue) : null,
          description: `Atelier privilege applied (-₹${discountNum.toLocaleString('en-IN')}).`,
          message: `Privilege code '${coupon.code}' applied (-₹${discountNum.toLocaleString('en-IN')}).`,
        }
      } catch (err) {
        console.warn('[Coupon Service] Database lookup fallback:', err.message)
      }
    }

    // 2. In-Memory Fallback
    const fallback = FALLBACK_COUPONS.find((c) => c.code === cleanCode)
    if (!fallback) {
      return {
        valid: false,
        message: `Privilege code '${cleanCode}' is invalid or expired.`,
      }
    }

    if (fallback.minOrderValue && Number(subtotalDec) < fallback.minOrderValue) {
      return {
        valid: false,
        message: `Code '${cleanCode}' requires a minimum allocation of ₹${fallback.minOrderValue.toLocaleString('en-IN')}.`,
      }
    }

    let discountAmount = 0
    if (fallback.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((Number(subtotalDec) * fallback.discountValue) / 100)
    } else {
      discountAmount = Math.min(Number(subtotalDec), fallback.discountValue)
    }

    return {
      valid: true,
      code: fallback.code,
      discount: discountAmount,
      percentage: fallback.discountType === 'PERCENTAGE' ? fallback.discountValue : null,
      description: fallback.description,
      message: `${fallback.description} applied (-₹${discountAmount.toLocaleString('en-IN')}).`,
    }
  },
}

export default couponService
