import { prisma, dbStatus } from '../config/db.js'
import { successResponse, errorResponse } from '../utils/response.js'

// In-memory fallback address store
export const mockAddresses = new Map()

/**
 * Get current user profile
 * Endpoint: GET /api/users/me
 */
export async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user.id

    if (dbStatus.isConnected && prisma) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            addresses: {
              orderBy: { isDefault: 'desc' },
            },
          },
        })

        if (user) {
          return successResponse(res, {
            message: 'Patron profile retrieved',
            data: user,
          })
        }
      } catch (err) {
        console.warn('[UserController] DB lookup fallback:', err.message)
      }
    }

    const userAddresses = mockAddresses.get(userId) || []
    return successResponse(res, {
      message: 'Patron profile retrieved',
      data: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role || 'CUSTOMER',
        addresses: userAddresses,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update current user profile
 * Endpoint: PATCH /api/users/me
 */
export async function updateCurrentUser(req, res, next) {
  try {
    const userId = req.user.id
    const { name, phone } = req.body

    if (dbStatus.isConnected && prisma) {
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(name ? { name } : {}),
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        return successResponse(res, {
          message: 'Patron profile updated successfully',
          data: updated,
        })
      } catch (err) {
        console.warn('[UserController] DB update fallback:', err.message)
      }
    }

    req.user.name = name || req.user.name
    return successResponse(res, {
      message: 'Patron profile updated successfully',
      data: {
        id: req.user.id,
        email: req.user.email,
        name: name || req.user.name,
        role: req.user.role || 'CUSTOMER',
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * List authenticated user's addresses
 * Endpoint: GET /api/users/me/addresses
 */
export async function getUserAddresses(req, res, next) {
  try {
    const userId = req.user.id

    if (dbStatus.isConnected && prisma) {
      try {
        const addresses = await prisma.address.findMany({
          where: { userId },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        })

        return successResponse(res, {
          message: 'Saved delivery destinations retrieved',
          data: addresses,
        })
      } catch (err) {
        console.warn('[UserController] Address list fallback:', err.message)
      }
    }

    const addresses = mockAddresses.get(userId) || []
    return successResponse(res, {
      message: 'Saved delivery destinations retrieved',
      data: addresses,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add address for authenticated user
 * Endpoint: POST /api/users/me/addresses
 */
export async function createUserAddress(req, res, next) {
  try {
    const userId = req.user.id
    const { name, phone, addressLine1, addressLine2, city, state, postalCode, isDefault = false } = req.body

    if (dbStatus.isConnected && prisma) {
      try {
        // If this address is set as default, reset others
        if (isDefault) {
          await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          })
        }

        const address = await prisma.address.create({
          data: {
            userId,
            name,
            phone,
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            state,
            postalCode,
            isDefault: Boolean(isDefault),
          },
        })

        return successResponse(res, {
          message: 'Delivery address created successfully',
          data: address,
          statusCode: 201,
        })
      } catch (err) {
        console.warn('[UserController] Address create fallback:', err.message)
      }
    }

    const newAddress = {
      id: `addr-${Date.now()}`,
      userId,
      name,
      phone,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      state,
      postalCode,
      isDefault: Boolean(isDefault),
      createdAt: new Date().toISOString(),
    }

    const userAddresses = mockAddresses.get(userId) || []
    if (isDefault) {
      userAddresses.forEach((a) => (a.isDefault = false))
    }
    userAddresses.push(newAddress)
    mockAddresses.set(userId, userAddresses)

    return successResponse(res, {
      message: 'Delivery address created successfully',
      data: newAddress,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update authenticated user's address (enforces ownership)
 * Endpoint: PATCH /api/users/me/addresses/:addressId
 */
export async function updateUserAddress(req, res, next) {
  try {
    const userId = req.user.id
    const { addressId } = req.params
    const updates = req.body

    if (dbStatus.isConnected && prisma) {
      try {
        const existing = await prisma.address.findUnique({
          where: { id: addressId },
        })

        if (!existing) {
          return errorResponse(res, {
            message: 'Address record not found',
            code: 'ADDRESS_NOT_FOUND',
            statusCode: 404,
          })
        }

        // Ownership enforcement
        if (existing.userId !== userId) {
          return errorResponse(res, {
            message: 'Access denied to address record',
            code: 'FORBIDDEN',
            statusCode: 403,
          })
        }

        if (updates.isDefault) {
          await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          })
        }

        const updated = await prisma.address.update({
          where: { id: addressId },
          data: updates,
        })

        return successResponse(res, {
          message: 'Delivery address updated successfully',
          data: updated,
        })
      } catch (err) {
        console.warn('[UserController] Address update fallback:', err.message)
      }
    }

    const userAddresses = mockAddresses.get(userId) || []
    const index = userAddresses.findIndex((a) => a.id === addressId)
    if (index === -1) {
      return errorResponse(res, {
        message: 'Address record not found',
        code: 'ADDRESS_NOT_FOUND',
        statusCode: 404,
      })
    }

    if (updates.isDefault) {
      userAddresses.forEach((a) => (a.isDefault = false))
    }

    userAddresses[index] = { ...userAddresses[index], ...updates, updatedAt: new Date().toISOString() }
    mockAddresses.set(userId, userAddresses)

    return successResponse(res, {
      message: 'Delivery address updated successfully',
      data: userAddresses[index],
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete authenticated user's address (enforces ownership)
 * Endpoint: DELETE /api/users/me/addresses/:addressId
 */
export async function deleteUserAddress(req, res, next) {
  try {
    const userId = req.user.id
    const { addressId } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        const existing = await prisma.address.findUnique({
          where: { id: addressId },
        })

        if (!existing) {
          return errorResponse(res, {
            message: 'Address record not found',
            code: 'ADDRESS_NOT_FOUND',
            statusCode: 404,
          })
        }

        // Ownership enforcement
        if (existing.userId !== userId) {
          return errorResponse(res, {
            message: 'Access denied to address record',
            code: 'FORBIDDEN',
            statusCode: 403,
          })
        }

        await prisma.address.delete({
          where: { id: addressId },
        })

        return successResponse(res, {
          message: 'Address record removed successfully',
          data: { id: addressId },
        })
      } catch (err) {
        console.warn('[UserController] Address delete fallback:', err.message)
      }
    }

    const userAddresses = mockAddresses.get(userId) || []
    const index = userAddresses.findIndex((a) => a.id === addressId)
    if (index === -1) {
      return errorResponse(res, {
        message: 'Address record not found',
        code: 'ADDRESS_NOT_FOUND',
        statusCode: 404,
      })
    }

    userAddresses.splice(index, 1)
    mockAddresses.set(userId, userAddresses)

    return successResponse(res, {
      message: 'Address record removed successfully',
      data: { id: addressId },
    })
  } catch (error) {
    next(error)
  }
}
