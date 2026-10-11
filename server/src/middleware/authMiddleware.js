import jwt from 'jsonwebtoken'
import { prisma, dbStatus } from '../config/db.js'
import config from '../config/env.js'
import { errorResponse } from '../utils/response.js'

/**
 * Authentication Middleware:
 * Inspects httpOnly cookie first, then checks Authorization Bearer header.
 */
export async function requireAuth(req, res, next) {
  const token = req.cookies?.aureva_token || req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return errorResponse(res, {
      message: 'Authentication required. No session token provided.',
      code: 'UNAUTHORIZED',
      statusCode: 401,
    })
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret)

    // Verify user still exists in database if database is connected
    if (dbStatus.isConnected && prisma) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, name: true, role: true },
        })

        if (!user) {
          return errorResponse(res, {
            message: 'Session user account no longer active.',
            code: 'ACCOUNT_INACTIVE',
            statusCode: 401,
          })
        }

        req.user = user
        return next()
      } catch (err) {
        console.warn('[Auth Middleware] Database verification fallback:', err.message)
      }
    }

    req.user = decoded
    next()
  } catch (err) {
    return errorResponse(res, {
      message: 'Session invalid or expired. Please sign in again.',
      code: 'INVALID_TOKEN',
      statusCode: 401,
    })
  }
}

/**
 * Optional authentication: attaches user if token exists, but doesn't block.
 */
export function optionalAuth(req, res, next) {
  const token = req.cookies?.aureva_token || req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret)
      req.user = decoded
    } catch {
      // Ignore invalid token in optional auth
    }
  }

  next()
}

/**
 * Admin authorization middleware:
 * Requires authenticated user with role === 'ADMIN'.
 * Never trusts a client-supplied role.
 */
export async function requireAdmin(req, res, next) {
  if (!req.user) {
    return errorResponse(res, {
      message: 'Authentication required before accessing atelier management resources.',
      code: 'UNAUTHORIZED',
      statusCode: 401,
    })
  }

  // Authoritatively check role from database if connected
  if (dbStatus.isConnected && prisma) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true },
      })
      if (!dbUser || dbUser.role !== 'ADMIN') {
        return errorResponse(res, {
          message: 'Elevated curator privileges required for this administrative operation.',
          code: 'FORBIDDEN',
          statusCode: 403,
        })
      }
      return next()
    } catch (err) {
      console.warn('[Admin Auth] DB check fallback:', err.message)
    }
  }

  if (req.user.role !== 'ADMIN') {
    return errorResponse(res, {
      message: 'Elevated curator privileges required for this administrative operation.',
      code: 'FORBIDDEN',
      statusCode: 403,
    })
  }

  next()
}
