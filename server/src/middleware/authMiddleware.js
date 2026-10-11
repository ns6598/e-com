import jwt from 'jsonwebtoken'
import config from '../config/env.js'
import { errorResponse } from '../utils/response.js'

/**
 * Authentication Middleware:
 * Inspects httpOnly cookie first, then checks Authorization Bearer header.
 */
export function requireAuth(req, res, next) {
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
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return errorResponse(res, {
      message: 'Authentication required before accessing atelier management resources.',
      code: 'UNAUTHORIZED',
      statusCode: 401,
    })
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
