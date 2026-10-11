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
          subpaths: {
            byId: '/api/products/:id',
            bySlug: '/api/products/slug/:slug',
            taxonomy: '/api/products/meta/categories',
          },
        },
        auth: {
          path: '/api/auth',
          subpaths: {
            register: { path: '/api/auth/register', method: 'POST' },
            login: { path: '/api/auth/login', method: 'POST', throttled: true },
            logout: { path: '/api/auth/logout', method: 'POST' },
            me: { path: '/api/auth/me', method: 'GET', auth: 'Bearer / Cookie' },
          },
        },
        users: {
          path: '/api/users',
          subpaths: {
            profile: { path: '/api/users/me', methods: ['GET', 'PATCH'], auth: 'Bearer / Cookie' },
            addresses: { path: '/api/users/me/addresses', methods: ['GET', 'POST'], auth: 'Bearer / Cookie' },
            addressById: { path: '/api/users/me/addresses/:addressId', methods: ['PATCH', 'DELETE'], auth: 'Bearer / Cookie' },
          },
        },
        orders: {
          path: '/api/orders',
          subpaths: {
            create: { path: '/api/orders', method: 'POST', auth: 'Customer' },
            list: { path: '/api/orders', method: 'GET', auth: 'Customer' },
            byId: { path: '/api/orders/:id', method: 'GET', auth: 'Customer' },
          },
        },
        cart: {
          path: '/api/cart',
          subpaths: {
            get: { path: '/api/cart', method: 'GET' },
            add: { path: '/api/cart/items', method: 'POST' },
            update: { path: '/api/cart/items/:itemId', method: 'PATCH' },
            remove: { path: '/api/cart/items/:itemId', method: 'DELETE' },
          },
        },
        wishlist: {
          path: '/api/wishlist',
          subpaths: {
            get: { path: '/api/wishlist', method: 'GET', auth: 'Customer' },
            add: { path: '/api/wishlist/items', method: 'POST', auth: 'Customer' },
            remove: { path: '/api/wishlist/items/:productId', method: 'DELETE', auth: 'Customer' },
            toggle: { path: '/api/wishlist/toggle', method: 'POST', auth: 'Customer' },
          },
        },
        coupons: {
          path: '/api/coupons',
          subpaths: {
            validate: { path: '/api/coupons/validate', method: 'POST' },
          },
        },
        admin: {
          path: '/api/admin',
          description: 'Privileged operations restricted to verified ADMIN patrons',
          subpaths: {
            products: { path: '/api/admin/products', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
            variants: { path: '/api/admin/products/:productId/variants', methods: ['POST'] },
            variantStock: { path: '/api/admin/variants/:id/stock', methods: ['PATCH'] },
            categories: { path: '/api/admin/categories', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
            orders: { path: '/api/admin/orders', methods: ['GET'] },
            orderStatus: { path: '/api/admin/orders/:id/status', methods: ['PATCH'] },
            coupons: { path: '/api/admin/coupons', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
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

export default apiRouter
