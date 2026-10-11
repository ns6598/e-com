import { successResponse } from '../utils/response.js'
import { checkDatabaseConnection, dbStatus } from '../config/db.js'
import config from '../config/env.js'

/**
 * Health check controller
 * Endpoint: GET /api/health
 */
export async function getHealth(req, res) {
  // Test connection or retrieve cached status
  const dbCheck = await checkDatabaseConnection()

  return successResponse(res, {
    message: 'AUREVA Atelier API is operational',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: config.nodeEnv,
      port: config.port,
      database: {
        connected: dbCheck.connected,
        status: dbCheck.message,
        provider: 'postgresql',
        orm: 'prisma',
      },
    },
    statusCode: 200,
  })
}
