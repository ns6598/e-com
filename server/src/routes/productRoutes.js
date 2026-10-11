import { Router } from 'express'
import { getProducts, getProductById, getProductTaxonomy } from '../controllers/productController.js'

const router = Router()

router.get('/', getProducts)
router.get('/meta/categories', getProductTaxonomy)
router.get('/:id', getProductById)

export default router
