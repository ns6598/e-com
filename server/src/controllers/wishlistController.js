import { prisma, dbStatus } from '../config/db.js'
import { successResponse, errorResponse } from '../utils/response.js'

const mockWishlists = new Map()

export async function getWishlist(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return errorResponse(res, {
        message: 'Authentication required to access atelier wishlist.',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      })
    }

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

export async function toggleWishlistItem(req, res, next) {
  try {
    const userId = req.user?.id
    const { productId } = req.body

    if (!userId) {
      return errorResponse(res, {
        message: 'Authentication required to save silhouettes.',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      })
    }

    if (!productId) {
      return errorResponse(res, {
        message: 'Product identifier is required.',
        code: 'MISSING_PRODUCT',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        // Find or create user wishlist
        let wishlist = await prisma.wishlist.findUnique({
          where: { userId },
        })

        if (!wishlist) {
          wishlist = await prisma.wishlist.create({
            data: { userId },
          })
        }

        // Check if item already exists in wishlist
        const existingItem = await prisma.wishlistItem.findUnique({
          where: {
            wishlistId_productId: {
              wishlistId: wishlist.id,
              productId,
            },
          },
        })

        if (existingItem) {
          await prisma.wishlistItem.delete({
            where: { id: existingItem.id },
          })
          return successResponse(res, {
            message: 'Silhouette removed from wishlist',
            data: { inWishlist: false, productId },
          })
        } else {
          const newItem = await prisma.wishlistItem.create({
            data: {
              wishlistId: wishlist.id,
              productId,
            },
            include: { product: true },
          })
          return successResponse(res, {
            message: 'Silhouette saved to wishlist',
            data: { inWishlist: true, item: newItem },
          })
        }
      } catch (err) {
        console.warn('[Wishlist Controller] Database write fallback:', err.message)
      }
    }

    // In-memory fallback
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
      })
    }
  } catch (error) {
    next(error)
  }
}
