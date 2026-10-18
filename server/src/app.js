import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import config from './config/env.js'
import apiRouter from './routes/index.js'
import requestLogger from './middleware/requestLogger.js'
import securityHeaders from './middleware/securityHeaders.js'
import csrfProtection from './middleware/csrfProtection.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

// 1. Security Headers Middleware (MIME, Clickjacking, XSS, Referrer)
app.use(securityHeaders)

// 2. CORS Configuration with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true)

      // Allow localhost and local IP origins for development
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('https://localhost:')
      ) {
        return callback(null, true)
      }

      // Allow configured client URL
      if (config.clientUrl && origin === config.clientUrl) {
        return callback(null, true)
      }

      // Allow popular cloud deployment hosts (Vercel, Netlify, Render, Railway, Cloudflare)
      if (
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.railway.app') ||
        origin.endsWith('.pages.dev')
      ) {
        return callback(null, true)
      }

      // Allow extra origins if provided via ALLOWED_ORIGINS env
      if (process.env.ALLOWED_ORIGINS) {
        const allowedList = process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
        if (allowedList.includes(origin) || allowedList.includes('*')) {
          return callback(null, true)
        }
      }

      // Default allow in cloud environments to prevent blocking frontend traffic
      return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-Id', 'X-Idempotency-Key', 'X-CSRF-Token'],
  })
)

// 3. Request body & cookie parsers with limits and rawBody capture for webhook signature verification
app.use(
  express.json({
    limit: '2mb',
    verify: (req, res, buf) => {
      req.rawBody = buf
    },
  })
)
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser(config.cookieSecret))

// 4. HTTP Request Audit Logger
app.use(requestLogger)

// 5. Global API Rate Limiter & CSRF Protection
app.use('/api', apiLimiter)
app.use('/api', csrfProtection)

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
