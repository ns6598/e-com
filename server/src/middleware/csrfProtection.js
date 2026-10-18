import config from '../config/env.js'
import { errorResponse } from '../utils/response.js'

/**
 * AUREVA CSRF (Cross-Site Request Forgery) Protection Middleware
 *
 * Protects cookie-authenticated state-changing endpoints (POST, PUT, PATCH, DELETE)
 * against unauthorized cross-site requests.
 *
 * Rules:
 * 1. Safe HTTP methods (GET, HEAD, OPTIONS) are exempt.
 * 2. Webhook routes (/api/payments/webhook/*) rely on cryptographic HMAC signature verification.
 * 3. Requests authenticated via custom Authorization: Bearer headers are inherently immune
 *    to cross-site request forgery as browsers never automatically attach custom authorization headers.
 * 4. For requests relying on ambient session cookies:
 *    - Validates presence of a custom header (X-Requested-With, X-CSRF-Token, or X-Session-Id), OR
 *    - Validates that the request Origin or Referer header matches the authorized client URL.
 */
export function csrfProtection(req, res, next) {
  // 1. Safe methods bypass CSRF checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // 2. Webhook endpoints use cryptographic signature verification, not CSRF tokens
  if (req.originalUrl.includes('/webhook')) {
    return next()
  }

  // 3. If request uses Authorization Bearer header, CSRF is not applicable
  const hasBearerAuth = Boolean(req.headers.authorization?.startsWith('Bearer '))
  const hasCookieAuth = Boolean(req.cookies?.aureva_token || req.cookies?.token)

  // If authenticated strictly via Bearer token and no ambient cookie is present, allow
  if (hasBearerAuth && !hasCookieAuth) {
    return next()
  }

  // 4. For ambient cookie-authenticated mutations, require a custom anti-CSRF header or trusted Origin
  if (hasCookieAuth) {
    const hasCustomHeader = Boolean(
      req.headers['x-requested-with'] ||
      req.headers['x-csrf-token'] ||
      req.headers['x-idempotency-key'] ||
      req.headers['x-session-id']
    )

    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : '')
    const isTrustedOrigin = Boolean(
      origin && (
        origin === config.clientUrl ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      )
    )

    if (!hasCustomHeader && !isTrustedOrigin) {
      return errorResponse(res, {
        message: 'Cross-Site Request Forgery validation failed. Cookie-authenticated state-changing requests must include an anti-CSRF custom header (e.g. X-Requested-With, X-CSRF-Token) or trusted Origin.',
        code: 'CSRF_VERIFICATION_FAILED',
        statusCode: 403,
      })
    }
  }

  return next()
}

export default csrfProtection
