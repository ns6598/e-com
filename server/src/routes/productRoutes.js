import { Router } from 'express'
import {
  getProducts,
  getProductById,
  getProductTaxonomy,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// Public Catalog Queries
router.get('/', getProducts)
router.get('/meta/categories', getProductTaxonomy)
router.get('/:id', getProductById)

// Protected Admin Repertoire Management
router.post('/', requireAuth, requireAdmin, createProduct)
router.put('/:id', requireAuth, requireAdmin, updateProduct)
router.delete('/:id', requireAuth, requireAdmin, deleteProduct)

export default router

