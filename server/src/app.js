import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import config from './config/env.js'
import apiRouter from './routes/index.js'
import requestLogger from './middleware/requestLogger.js'
import securityHeaders from './middleware/securityHeaders.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

// 1. Security Headers Middleware (MIME, Clickjacking, XSS, Referrer)
app.use(securityHeaders)

// 2. CORS Configuration with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matching frontend URL
      if (!origin || origin === config.clientUrl || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-Id', 'X-Idempotency-Key'],
  })
)

// 3. Request body & cookie parsers with limits
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser(config.cookieSecret))

// 4. HTTP Request Audit Logger
app.use(requestLogger)

// 5. Global API Rate Limiter
app.use('/api', apiLimiter)

// 6. Root API Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'AUREVA Haute Couture REST API',
    tagline: 'Style without boundaries.',
    sitemap: '/api',
    health: '/api/health',
    version: '1.0.0',
  })
})

// 7. Mount API Routes under /api
app.use('/api', apiRouter)

// 8. 404 Resource Handler
app.use(notFoundHandler)

// 9. Centralized Error Handler
app.use(errorHandler)

export default app
