import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import config from './config/env.js'
import apiRouter from './routes/index.js'
import requestLogger from './middleware/requestLogger.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

// 1. CORS Configuration for intended frontend origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matching frontend URL
      if (!origin || origin === config.clientUrl || origin.startsWith('http://localhost:')) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

// 2. Request body & cookie parsers
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(cookieParser(config.cookieSecret))

// 3. HTTP Request Audit & Performance Logger
app.use(requestLogger)

// 4. Root API Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'AUREVA Haute Couture REST API',
    tagline: 'Style without boundaries.',
    sitemap: '/api',
    health: '/api/health',
    version: '1.0.0',
  })
})

// 5. Mount API Routes under /api
app.use('/api', apiRouter)

// 6. 404 Resource Handler
app.use(notFoundHandler)

// 7. Centralized Error Handler
app.use(errorHandler)

export default app
