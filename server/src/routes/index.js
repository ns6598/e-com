import { Router } from 'express'
import healthRoutes from './healthRoutes.js'
import productRoutes from './productRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import authRoutes from './authRoutes.js'
import userRoutes from './userRoutes.js'
import orderRoutes from './orderRoutes.js'
import cartRoutes from './cartRoutes.js'
import wishlistRoutes from './wishlistRoutes.js'
import couponRoutes from './couponRoutes.js'
import adminRoutes from './adminRoutes.js'
import newsletterRoutes from './newsletterRoutes.js'
import contactRoutes from './contactRoutes.js'
import paymentRoutes from './paymentRoutes.js'
import { successResponse } from '../utils/response.js'

const apiRouter = Router()

// Root API Discovery / Sitemap Endpoint (GET /api)
apiRouter.get('/', (req, res) => {
  return successResponse(res, {
    message: 'AUREVA Haute Couture REST API Directory',
    data: {
      version: '1.0.0',
      brand: 'AUREVA',
      tagline: 'Style without boundaries.',
      endpoints: {
        health: {
          path: '/api/health',
          methods: ['GET'],
          description: 'System diagnostics, database status, and uptime',
        },
        categories: {
          path: '/api/categories',
          methods: ['GET'],
          description: 'Retrieve category list with counts and department tags',
        },
        products: {
          path: '/api/products',
          methods: ['GET'],
          description: 'Catalog filtering by department, category, search, size, color, price range, sale, and sorting',
        },
        payments: {
          path: '/api/payments',
          subpaths: {
            config: { path: '/api/payments/config', method: 'GET' },
            createSession: { path: '/api/payments/create-session', method: 'POST', auth: 'Customer' },
            verify: { path: '/api/payments/verify', method: 'POST', auth: 'Customer' },
            webhook: { path: '/api/payments/webhook/:provider', method: 'POST' },
          },
        },
      },
    },
  })
})

// Mount Sub-Routers
apiRouter.use('/health', healthRoutes)
apiRouter.use('/categories', categoryRoutes)
apiRouter.use('/products', productRoutes)
apiRouter.use('/auth', authRoutes)
apiRouter.use('/users', userRoutes)
apiRouter.use('/orders', orderRoutes)
apiRouter.use('/cart', cartRoutes)
apiRouter.use('/wishlist', wishlistRoutes)
apiRouter.use('/coupons', couponRoutes)
apiRouter.use('/admin', adminRoutes)
apiRouter.use('/newsletter', newsletterRoutes)
apiRouter.use('/contact', contactRoutes)
apiRouter.use('/payments', paymentRoutes)

export default apiRouter
