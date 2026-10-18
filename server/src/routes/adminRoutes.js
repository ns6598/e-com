import { Router } from 'express'
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminAddVariant,
  adminUpdateVariantStock,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminGetDashboardStats,
  adminListCustomers,
  adminGetCustomerById,
  adminGetCustomerOrders,
  adminGetLoginActivity,
  adminListInquiries,
  adminUpdateInquiryStatus,
} from '../controllers/adminController.js'
import { listOrders, updateOrderStatus } from '../controllers/orderController.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import {
  createProductSchema,
  updateProductSchema,
  categorySchema,
  updateCategorySchema,
  variantSchema,
  updateStockSchema,
} from '../validators/productValidator.js'
import { createCouponSchema, updateCouponSchema } from '../validators/couponValidator.js'
import { updateOrderStatusSchema } from '../validators/orderValidator.js'

const router = Router()

// All Admin routes strictly require authentication and ADMIN role verification
router.use(requireAuth, requireAdmin)

// Executive Metrics & Analytics
router.get('/stats', adminGetDashboardStats)

// Product Management
router.get('/products', adminListProducts)
router.post('/products', validate(createProductSchema), adminCreateProduct)
router.patch('/products/:id', validate(updateProductSchema), adminUpdateProduct)
router.delete('/products/:id', adminDeleteProduct)

// Variant & Stock Management
router.post('/products/:productId/variants', validate(variantSchema), adminAddVariant)
router.patch('/variants/:id/stock', validate(updateStockSchema), adminUpdateVariantStock)

// Category Management
router.get('/categories', adminListCategories)
router.post('/categories', validate(categorySchema), adminCreateCategory)
router.patch('/categories/:id', validate(updateCategorySchema), adminUpdateCategory)
router.delete('/categories/:id', adminDeleteCategory)

// Order Management
router.get('/orders', listOrders)
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus)

// Coupon Management
router.get('/coupons', adminListCoupons)
router.post('/coupons', validate(createCouponSchema), adminCreateCoupon)
router.patch('/coupons/:id', validate(updateCouponSchema), adminUpdateCoupon)
router.delete('/coupons/:id', adminDeleteCoupon)

// Patron Directory, Customer Orders & Login Activity
router.get('/customers', adminListCustomers)
router.get('/customers/:id', adminGetCustomerById)
router.get('/customers/:id/orders', adminGetCustomerOrders)
router.get('/login-activity', adminGetLoginActivity)

// Concierge Inquiries
router.get('/inquiries', adminListInquiries)
router.patch('/inquiries/:id/status', adminUpdateInquiryStatus)

export default router
