import { Router } from 'express'
import healthRoutes from './healthRoutes.js'
import productRoutes from './productRoutes.js'
import authRoutes from './authRoutes.js'
import orderRoutes from './orderRoutes.js'
import couponRoutes from './couponRoutes.js'
import newsletterRoutes from './newsletterRoutes.js'
import contactRoutes from './contactRoutes.js'
import cartRoutes from './cartRoutes.js'
import wishlistRoutes from './wishlistRoutes.js'
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
        products: {
          path: '/api/products',
          methods: ['GET'],
          description: 'Catalog filtering by department, category, search, sorting',
          subpaths: {
            byId: '/api/products/:id',
            taxonomy: '/api/products/meta/categories',
          },
        },
        auth: {
          path: '/api/auth',
          subpaths: {
            register: { path: '/api/auth/register', method: 'POST' },
            login: { path: '/api/auth/login', method: 'POST' },
            logout: { path: '/api/auth/logout', method: 'POST' },
            me: { path: '/api/auth/me', method: 'GET', auth: 'Bearer / Cookie' },
          },
        },
        orders: {
          path: '/api/orders',
          subpaths: {
            create: { path: '/api/orders', method: 'POST' },
            byId: { path: '/api/orders/:id', method: 'GET' },
          },
        },
        cart: {
          path: '/api/cart',
          subpaths: {
            get: { path: '/api/cart', method: 'GET' },
            add: { path: '/api/cart/items', method: 'POST' },
            remove: { path: '/api/cart/items/:itemId', method: 'DELETE' },
          },
        },
        wishlist: {
          path: '/api/wishlist',
          subpaths: {
            get: { path: '/api/wishlist', method: 'GET' },
            toggle: { path: '/api/wishlist/toggle', method: 'POST' },
          },
        },
        coupons: {
          path: '/api/coupons',
          subpaths: {
            validate: { path: '/api/coupons/validate', method: 'POST' },
          },
        },
        newsletter: {
          path: '/api/newsletter',
          subpaths: {
            subscribe: { path: '/api/newsletter/subscribe', method: 'POST' },
          },
        },
        contact: {
          path: '/api/contact',
          subpaths: {
            inquiry: { path: '/api/contact', method: 'POST' },
          },
        },
      },
    },
  })
})

// Mount Sub-Routers
apiRouter.use('/health', healthRoutes)
apiRouter.use('/products', productRoutes)
apiRouter.use('/auth', authRoutes)
apiRouter.use('/orders', orderRoutes)
apiRouter.use('/cart', cartRoutes)
apiRouter.use('/wishlist', wishlistRoutes)
apiRouter.use('/coupons', couponRoutes)
apiRouter.use('/newsletter', newsletterRoutes)
apiRouter.use('/contact', contactRoutes)

export default apiRouter
