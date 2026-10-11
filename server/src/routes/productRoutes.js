import { Router } from 'express'
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductTaxonomy,
} from '../controllers/productController.js'
import validate from '../middleware/validate.js'
import { productQuerySchema } from '../validators/productValidator.js'

const router = Router()

// Public Catalog Queries
router.get('/', validate(productQuerySchema, 'query'), getProducts)
router.get('/meta/categories', getProductTaxonomy)
router.get('/slug/:slug', getProductBySlug)
router.get('/:id', getProductById)

export default router
