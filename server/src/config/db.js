import { PrismaClient } from '@prisma/client'
import config from './env.js'

let prismaInstance = null

try {
  prismaInstance = new PrismaClient({
    log: config.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  })
} catch (error) {
  console.warn('[AUREVA Database] PrismaClient initialization deferred:', error.message)
}

export const prisma = prismaInstance

export const dbStatus = {
  isConnected: false,
  lastChecked: null,
  message: 'Database connection not yet verified',
}

/**
 * Checks database connectivity without crashing the server if Postgres is not yet configured.
 * Tests connection via $queryRaw.
 */
export async function checkDatabaseConnection() {
  dbStatus.lastChecked = new Date().toISOString()

  if (!config.databaseUrl || config.databaseUrl.includes('USER:PASSWORD')) {
    dbStatus.isConnected = false
    dbStatus.message = 'DATABASE_URL contains placeholder credentials. Configuration required.'
    return { connected: false, message: dbStatus.message }
  }

  if (!prisma) {
    dbStatus.isConnected = false
    dbStatus.message = 'Prisma client is not initialized.'
    return { connected: false, message: dbStatus.message }
  }

  try {
    // Run minimal ping query
    await prisma.$queryRaw`SELECT 1`
    dbStatus.isConnected = true
    dbStatus.message = 'PostgreSQL database connected successfully via Prisma.'
    return { connected: true, message: dbStatus.message }
  } catch (error) {
    dbStatus.isConnected = false
    dbStatus.message = `Database connection failed: ${error.message}`
    return { connected: false, message: dbStatus.message }
  }
}

export default prisma
