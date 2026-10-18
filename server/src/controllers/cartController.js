import { prisma, dbStatus } from '../config/db.js'
import { successResponse, errorResponse } from '../utils/response.js'

const mockCarts = new Map()

function getCartIdentifier(req) {
  const userId = req.user?.id || null
  const sessionId = req.headers['x-session-id'] || req.cookies?.aureva_session_id || null
  return { userId, sessionId, key: userId || sessionId || 'anonymous_cart' }
}

/**
 * Get current shopping cart
 * Endpoint: GET /api/cart
 */
export async function getCart(req, res, next) {
  try {
    const { userId, sessionId, key } = getCartIdentifier(req)

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
                      include: { images: true, category: true },
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

    const cart = mockCarts.get(key) || { id: `mock-cart-${key}`, items: [] }
    return successResponse(res, {
      message: 'Cart retrieved successfully',
      data: cart,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add product variant to shopping cart
 * Endpoint: POST /api/cart/items
 */
export async function addToCart(req, res, next) {
  try {
    const { userId, sessionId, key } = getCartIdentifier(req)
    const variantId = req.body.variantId || req.body.productId
    const quantity = req.body.quantity !== undefined ? req.body.quantity : 1

    if (quantity <= 0) {
      return errorResponse(res, {
        message: 'Quantity must be at least 1.',
        code: 'INVALID_QUANTITY',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
          include: { product: true },
        })

        if (!variant || !variant.product.isActive) {
          return errorResponse(res, {
            message: 'Product variant is not available in atelier catalogue.',
            code: 'VARIANT_NOT_FOUND',
            statusCode: 404,
          })
        }

        if (variant.stockQuantity < quantity) {
          return errorResponse(res, {
            message: `Requested quantity exceeds available stock (${variant.stockQuantity} available).`,
            code: 'INSUFFICIENT_STOCK',
            statusCode: 400,
          })
        }

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

        // Upsert cart item to prevent duplicate lines for the same variant
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
          message: 'Item allocated to shopping cart',
          data: cartItem,
          statusCode: 201,
        })
      } catch (err) {
        console.warn('[Cart Controller] Database write fallback:', err.message)
      }
    }

    // In-memory fallback
    let cart = mockCarts.get(key)
    if (!cart) {
      cart = { id: `mock-cart-${key}`, items: [] }
      mockCarts.set(key, cart)
    }

    const existing = cart.items.find((i) => i.variantId === variantId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.items.push({
        id: `mock-cart-item-${Date.now()}`,
        variantId,
        quantity,
        createdAt: new Date().toISOString(),
      })
    }

    return successResponse(res, {
      message: 'Item added to shopping bag',
      data: cart,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update quantity of cart item (enforces cart ownership)
 * Endpoint: PATCH /api/cart/items/:itemId
 */
export async function updateCartItem(req, res, next) {
  try {
    const { userId, sessionId, key } = getCartIdentifier(req)
    const { itemId } = req.params
    const { quantity } = req.body

    if (quantity <= 0) {
      return errorResponse(res, {
        message: 'Quantity must be at least 1. To remove an item, use DELETE.',
        code: 'INVALID_QUANTITY',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        const item = await prisma.cartItem.findUnique({
          where: { id: itemId },
          include: {
            cart: true,
            variant: true,
          },
        })

        if (!item) {
          return errorResponse(res, {
            message: 'Cart item not found',
            code: 'NOT_FOUND',
            statusCode: 404,
          })
        }

        // Ownership verification
        const isOwner = (userId && item.cart.userId === userId) || (sessionId && item.cart.sessionId === sessionId)
        if (!isOwner) {
          return errorResponse(res, {
            message: 'Access denied to cart resource',
            code: 'FORBIDDEN',
            statusCode: 403,
          })
        }

        // Stock check
        if (item.variant && item.variant.stockQuantity < quantity) {
          return errorResponse(res, {
            message: `Requested quantity exceeds available stock (${item.variant.stockQuantity} available).`,
            code: 'INSUFFICIENT_STOCK',
            statusCode: 400,
          })
        }

        const updated = await prisma.cartItem.update({
          where: { id: itemId },
          data: { quantity },
          include: {
            variant: {
              include: { product: true },
            },
          },
        })

        return successResponse(res, {
          message: 'Cart item quantity updated',
          data: updated,
        })
      } catch (err) {
        console.warn('[Cart Controller] Update fallback:', err.message)
      }
    }

    const cart = mockCarts.get(key)
    const item = cart?.items.find((i) => i.id === itemId)
    if (!item) {
      return errorResponse(res, {
        message: 'Cart item not found',
        code: 'NOT_FOUND',
        statusCode: 404,
      })
    }

    item.quantity = quantity
    return successResponse(res, {
      message: 'Cart item quantity updated',
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Remove item from cart (enforces cart ownership)
 * Endpoint: DELETE /api/cart/items/:itemId
 */
export async function removeCartItem(req, res, next) {
  try {
    const { userId, sessionId, key } = getCartIdentifier(req)
    const { itemId } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        const item = await prisma.cartItem.findUnique({
          where: { id: itemId },
          include: { cart: true },
        })

        if (!item) {
          return errorResponse(res, {
            message: 'Cart item not found',
            code: 'NOT_FOUND',
            statusCode: 404,
          })
        }

        // Ownership verification
        const isOwner = (userId && item.cart.userId === userId) || (sessionId && item.cart.sessionId === sessionId)
        if (!isOwner) {
          return errorResponse(res, {
            message: 'Access denied to cart resource',
            code: 'FORBIDDEN',
            statusCode: 403,
          })
        }

        await prisma.cartItem.delete({
          where: { id: itemId },
        })

        return successResponse(res, {
          message: 'Item removed from shopping cart',
          data: { id: itemId },
        })
      } catch (err) {
        console.warn('[Cart Controller] Delete fallback:', err.message)
      }
    }

    const cart = mockCarts.get(key)
    if (cart) {
      const idx = cart.items.findIndex((i) => i.id === itemId)
      if (idx !== -1) {
        cart.items.splice(idx, 1)
      }
    }

    return successResponse(res, {
      message: 'Item removed from shopping cart',
      data: { id: itemId },
    })
  } catch (error) {
    next(error)
  }
}
