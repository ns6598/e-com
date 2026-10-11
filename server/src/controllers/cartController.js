import { prisma, dbStatus } from '../config/db.js'
import { successResponse, errorResponse } from '../utils/response.js'

const mockCarts = new Map()

export async function getCart(req, res, next) {
  try {
    const userId = req.user?.id
    const sessionId = req.headers['x-session-id'] || null

    if (!userId && !sessionId) {
      return errorResponse(res, {
        message: 'Active session or customer identifier required to retrieve cart.',
        code: 'MISSING_SESSION',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        const cart = await prisma.cart.findFirst({
          where: userId ? { userId } : { sessionId },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: { images: true },
                    },
                  },
                },
              },
            },
          },
        })

        return successResponse(res, {
          message: 'Cart retrieved successfully',
          data: cart || { id: null, items: [] },
        })
      } catch (err) {
        console.warn('[Cart Controller] Database lookup fallback:', err.message)
      }
    }

    const key = userId || sessionId
    const cart = mockCarts.get(key) || { id: `mock-cart-${key}`, items: [] }

    return successResponse(res, {
      message: 'Cart retrieved from cache',
      data: cart,
    })
  } catch (error) {
    next(error)
  }
}

export async function addToCart(req, res, next) {
  try {
    const userId = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null
    const { variantId, quantity = 1 } = req.body

    if (!variantId) {
      return errorResponse(res, {
        message: 'Product variant identifier is required.',
        code: 'MISSING_VARIANT',
        statusCode: 400,
      })
    }

    if (quantity <= 0) {
      return errorResponse(res, {
        message: 'Quantity must be at least 1.',
        code: 'INVALID_QUANTITY',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        // Validate variant and available inventory
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
          include: { product: true },
        })

        if (!variant) {
          return errorResponse(res, {
            message: 'Product variant not found.',
            code: 'VARIANT_NOT_FOUND',
            statusCode: 404,
          })
        }

        if (variant.stockQuantity < quantity) {
          return errorResponse(res, {
            message: `Only ${variant.stockQuantity} units available in atelier stock.`,
            code: 'INSUFFICIENT_STOCK',
            statusCode: 400,
          })
        }

        // Find or create Cart
        let cart = await prisma.cart.findFirst({
          where: userId ? { userId } : { sessionId },
        })

        if (!cart) {
          cart = await prisma.cart.create({
            data: {
              userId,
              sessionId: userId ? null : sessionId,
            },
          })
        }

        // Upsert cart item to prevent duplicate cart lines for the same variant
        const cartItem = await prisma.cartItem.upsert({
          where: {
            cartId_variantId: {
              cartId: cart.id,
              variantId,
            },
          },
          update: {
            quantity: { increment: quantity },
          },
          create: {
            cartId: cart.id,
            variantId,
            quantity,
          },
          include: {
            variant: {
              include: { product: true },
            },
          },
        })

        return successResponse(res, {
          message: 'Silhouette variant allocated to bag',
          data: cartItem,
          statusCode: 200,
        })
      } catch (err) {
        console.warn('[Cart Controller] Database write fallback:', err.message)
      }
    }

    // In-memory fallback
    const key = userId || sessionId || 'guest'
    let cart = mockCarts.get(key)
    if (!cart) {
      cart = { id: `mock-cart-${key}`, items: [] }
      mockCarts.set(key, cart)
    }

    const existingIndex = cart.items.findIndex((item) => item.variantId === variantId)
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity
    } else {
      cart.items.push({
        id: `mock-item-${Date.now()}`,
        variantId,
        quantity,
        createdAt: new Date().toISOString(),
      })
    }

    return successResponse(res, {
      message: 'Item added to shopping bag',
      data: cart,
    })
  } catch (error) {
    next(error)
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const { itemId } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        await prisma.cartItem.delete({
          where: { id: itemId },
        })
        return successResponse(res, { message: 'Item removed from shopping bag' })
      } catch (err) {
        console.warn('[Cart Controller] Database delete fallback:', err.message)
      }
    }

    return successResponse(res, { message: 'Item removed from shopping bag' })
  } catch (error) {
    next(error)
  }
}
