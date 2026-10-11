import logger from '../utils/logger.js'

/**
 * Lightweight HTTP request performance and audit logger
 */
export function requestLogger(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    // Skip noisy polling logs or log cleanly
    logger.http(req.method, req.originalUrl, res.statusCode, duration)
  })

  next()
}

export default requestLogger
