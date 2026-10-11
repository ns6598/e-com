import { Router } from 'express'
import { getCategories } from '../controllers/productController.js'

const router = Router()

// Public Category Endpoint: GET /api/categories
router.get('/', getCategories)

export default router
