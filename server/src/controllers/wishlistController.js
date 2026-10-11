import { prisma, dbStatus } from '../config/db.js'
import { successResponse, errorResponse } from '../utils/response.js'

const mockWishlists = new Map()

/**
 * Get current user wishlist
 * Endpoint: GET /api/wishlist
 */
export async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id

    if (dbStatus.isConnected && prisma) {
      try {
        const wishlist = await prisma.wishlist.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: true,
                    variants: true,
                    category: true,
                  },
                },
              },
            },
          },
        })

        return successResponse(res, {
          message: 'Atelier wishlist retrieved',
          data: wishlist || { id: null, items: [] },
        })
      } catch (err) {
        console.warn('[Wishlist Controller] Database lookup fallback:', err.message)
      }
    }

    const wishlist = mockWishlists.get(userId) || { id: `mock-wl-${userId}`, items: [] }
    return successResponse(res, {
      message: 'Atelier wishlist retrieved',
      data: wishlist,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add product to wishlist
 * Endpoint: POST /api/wishlist/items
 */
export async function addWishlistItem(req, res, next) {
  try {
    const userId = req.user.id
    const { productId } = req.body

    if (!productId) {
      return errorResponse(res, {
        message: 'Product identifier is required.',
        code: 'MISSING_PRODUCT',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        let wishlist = await prisma.wishlist.findUnique({
          where: { userId },
        })

        if (!wishlist) {
          wishlist = await prisma.wishlist.create({
            data: { userId },
          })
        }

        const item = await prisma.wishlistItem.upsert({
          where: {
            wishlistId_productId: {
              wishlistId: wishlist.id,
              productId,
            },
          },
          update: {},
          create: {
            wishlistId: wishlist.id,
            productId,
          },
          include: { product: true },
        })

        return successResponse(res, {
          message: 'Silhouette saved to wishlist',
          data: item,
          statusCode: 201,
        })
      } catch (err) {
        console.warn('[Wishlist Controller] Database write fallback:', err.message)
      }
    }

    let wl = mockWishlists.get(userId)
    if (!wl) {
      wl = { id: `mock-wl-${userId}`, items: [] }
      mockWishlists.set(userId, wl)
    }

    let item = wl.items.find((i) => i.productId === productId)
    if (!item) {
      item = { id: `wl-item-${Date.now()}`, productId, createdAt: new Date().toISOString() }
      wl.items.push(item)
    }

    return successResponse(res, {
      message: 'Silhouette saved to wishlist',
      data: item,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Remove product from wishlist
 * Endpoint: DELETE /api/wishlist/items/:productId
 */
export async function removeWishlistItem(req, res, next) {
  try {
    const userId = req.user.id
    const { productId } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        const wishlist = await prisma.wishlist.findUnique({
          where: { userId },
        })

        if (wishlist) {
          await prisma.wishlistItem.deleteMany({
            where: {
              wishlistId: wishlist.id,
              productId,
            },
          })
        }

        return successResponse(res, {
          message: 'Silhouette removed from wishlist',
          data: { productId },
        })
      } catch (err) {
        console.warn('[Wishlist Controller] Database delete fallback:', err.message)
      }
    }

    const wl = mockWishlists.get(userId)
    if (wl) {
      const idx = wl.items.findIndex((i) => i.productId === productId)
      if (idx !== -1) {
        wl.items.splice(idx, 1)
      }
    }

    return successResponse(res, {
      message: 'Silhouette removed from wishlist',
      data: { productId },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Toggle wishlist item (convenience endpoint for frontend)
 * Endpoint: POST /api/wishlist/toggle
 */
export async function toggleWishlistItem(req, res, next) {
  try {
    const userId = req.user.id
    const { productId } = req.body

    if (!productId) {
      return errorResponse(res, {
        message: 'Product identifier is required.',
        code: 'MISSING_PRODUCT',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        let wishlist = await prisma.wishlist.findUnique({ where: { userId } })
        if (!wishlist) {
          wishlist = await prisma.wishlist.create({ data: { userId } })
        }

        const existing = await prisma.wishlistItem.findUnique({
          where: {
            wishlistId_productId: {
              wishlistId: wishlist.id,
              productId,
            },
          },
        })

        if (existing) {
          await prisma.wishlistItem.delete({ where: { id: existing.id } })
          return successResponse(res, {
            message: 'Silhouette removed from wishlist',
            data: { inWishlist: false, productId },
          })
        } else {
          const item = await prisma.wishlistItem.create({
            data: { wishlistId: wishlist.id, productId },
            include: { product: true },
          })
          return successResponse(res, {
            message: 'Silhouette saved to wishlist',
            data: { inWishlist: true, item },
            statusCode: 201,
          })
        }
      } catch (err) {
        console.warn('[Wishlist Controller] DB toggle fallback:', err.message)
      }
    }

    let wl = mockWishlists.get(userId)
    if (!wl) {
      wl = { id: `mock-wl-${userId}`, items: [] }
      mockWishlists.set(userId, wl)
    }

    const idx = wl.items.findIndex((i) => i.productId === productId)
    if (idx > -1) {
      wl.items.splice(idx, 1)
      return successResponse(res, {
        message: 'Silhouette removed from wishlist',
        data: { inWishlist: false, productId },
      })
    } else {
      wl.items.push({ id: `wl-item-${Date.now()}`, productId, createdAt: new Date().toISOString() })
      return successResponse(res, {
        message: 'Silhouette saved to wishlist',
        data: { inWishlist: true, productId },
        statusCode: 201,
      })
    }
  } catch (error) {
    next(error)
  }
}
