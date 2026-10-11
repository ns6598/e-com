import app from './app.js'
import config from './config/env.js'
import { checkDatabaseConnection } from './config/db.js'

async function startServer() {
  // Test database connection on boot (non-blocking)
  const dbStatus = await checkDatabaseConnection()

  const server = app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  AUREVA ATELIER BACKEND API                   ║
║               "Style without boundaries."                     ║
╠═══════════════════════════════════════════════════════════════╣
║  • Server running on:       http://localhost:${config.port}           ║
║  • Health Check:            http://localhost:${config.port}/api/health    ║
║  • Client Origin:           ${config.clientUrl.padEnd(33)} ║
║  • Environment:             ${config.nodeEnv.padEnd(33)} ║
║  • Database Status:         ${(dbStatus.connected ? 'CONNECTED (PostgreSQL)' : 'PENDING CONFIGURATION').padEnd(33)} ║
╚═══════════════════════════════════════════════════════════════╝
    `)

    if (!dbStatus.connected) {
      console.log(`[AUREVA Notice] Database is in mock/fallback mode. ${dbStatus.message}`)
      console.log(`[AUREVA Notice] To connect PostgreSQL, update DATABASE_URL in server/.env and run: npm run prisma:migrate\n`)
    }
  })

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Closing HTTP server gracefully...`)
    server.close(() => {
      console.log('[Server] HTTP server closed.')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}

startServer().catch((err) => {
  console.error('[AUREVA Server] Failed to start server:', err)
  process.exit(1)
})
