/**
 * Consistent API response utilities
 */

export function successResponse(res, { data = null, message = 'Success', statusCode = 200 } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export function errorResponse(res, { message = 'Internal Server Error', code = 'ERROR', details = null, statusCode = 500 } = {}) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      details,
    },
  })
}
