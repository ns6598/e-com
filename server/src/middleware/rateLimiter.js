import { errorResponse } from '../utils/response.js'

/**
 * Lightweight in-memory rate limiter and throttling middleware
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 mins)
 * @param {number} options.max - Maximum requests allowed within windowMs (default: 100)
 * @param {string} options.message - Error message when rate limit is exceeded
 * @param {string} options.keyGenerator - Custom key generator function (req => string)
 */
export function rateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests from this IP. Please try again later.',
  keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip',
} = {}) {
  const hits = new Map()

  // Periodically cleanup expired buckets every 5 minutes
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key)
      }
    }
  }, 5 * 60 * 1000).unref()

  return (req, res, next) => {
    const key = keyGenerator(req)
    const now = Date.now()

    let record = hits.get(key)
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      }
      hits.set(key, record)
    } else {
      record.count += 1
    }

    const remaining = Math.max(0, max - record.count)
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000)

    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', resetSeconds)

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds)
      return errorResponse(res, {
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
      })
    }

    next()
  }
}

/**
 * Throttling specifically for authentication login attempts
 * Limits to 5 failed/total attempts per 15-minute window per IP/email
 */
export const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: 'Too many authentication attempts. For your security, access has been temporarily restricted. Please try again in 15 minutes.',
  keyGenerator: (req) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'client-ip'
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : ''
    return `login:${ip}:${email}`
  },
})

/**
 * General API rate limiter (120 requests per minute)
 */
export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 180,
  message: 'Atelier API rate quota exceeded. Please slow down your requests.',
})

export default rateLimiter
