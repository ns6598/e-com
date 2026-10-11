import { Router } from 'express'
import healthRoutes from './healthRoutes.js'
import productRoutes from './productRoutes.js'
import authRoutes from './authRoutes.js'
import orderRoutes from './orderRoutes.js'

const apiRouter = Router()

// Mount sub-routers
apiRouter.use('/health', healthRoutes)
apiRouter.use('/products', productRoutes)
apiRouter.use('/auth', authRoutes)
apiRouter.use('/orders', orderRoutes)

export default apiRouter
