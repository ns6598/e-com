import { ZodError } from 'zod'
import { errorResponse } from '../utils/response.js'
import config from '../config/env.js'

/**
 * Centralized Global Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  // If headers are already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err)
  }

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))

    return errorResponse(res, {
      message: 'Request validation failed',
      code: 'VALIDATION_ERROR',
      details: formattedDetails,
      statusCode: 400,
    })
  }

  // 2. Body Parser JSON Syntax Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, {
      message: 'Malformed JSON payload in request body',
      code: 'INVALID_JSON',
      statusCode: 400,
    })
  }

  // 3. Custom Application / HTTP Error
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'An internal server error occurred'
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR')

  if (config.nodeEnv === 'development') {
    console.error(`[Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err)
  }

  return errorResponse(res, {
    message,
    code,
    details: config.nodeEnv === 'development' ? err.stack : null,
    statusCode,
  })
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res) {
  return errorResponse(res, {
    message: `Cannot ${req.method} ${req.originalUrl} - Resource not found`,
    code: 'ROUTE_NOT_FOUND',
    statusCode: 404,
  })
}
