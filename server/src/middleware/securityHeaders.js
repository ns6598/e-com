/**
 * Standard Security Headers Middleware
 * Protects against MIME sniffing, clickjacking, XSS, and embeds
 */
export function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Cross-Site Scripting Filter
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)')

  // Remove Express signature
  res.removeHeader('X-Powered-By')

  // HSTS in production environments
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  next()
}

export default securityHeaders
