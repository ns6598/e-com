import { Router } from 'express'
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminAddVariant,
  adminUpdateVariantStock,
  adminGetInventory,
  adminUpdateInventory,
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
import { vaultLogin } from '../controllers/authController.js'
import { listOrders, updateOrderStatus } from '../controllers/orderController.js'
import { requireAuth, requireAdmin, authenticateUser } from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import { loginSchema } from '../validators/authValidator.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
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

// Dedicated Vault / Admin Login endpoint (pre-auth)
router.post('/login', loginLimiter, validate(loginSchema), vaultLogin)

// All subsequent Admin routes strictly require authentication and ADMIN role verification
router.use(authenticateUser, requireAdmin)

// Executive Metrics & Analytics (GET /api/admin/dashboard & /stats)
router.get('/dashboard', adminGetDashboardStats)
router.get('/stats', adminGetDashboardStats)

// Product Management (GET, POST, PATCH, DELETE /api/admin/products)
router.get('/products', adminListProducts)
router.post('/products', validate(createProductSchema), adminCreateProduct)
router.patch('/products/:id', validate(updateProductSchema), adminUpdateProduct)
router.delete('/products/:id', adminDeleteProduct)

// Variant & Inventory Management (GET, PATCH /api/admin/inventory & variants)
router.get('/inventory', adminGetInventory)
router.patch('/inventory/:id', adminUpdateInventory)
router.post('/products/:productId/variants', validate(variantSchema), adminAddVariant)
router.patch('/variants/:id/stock', validate(updateStockSchema), adminUpdateVariantStock)

// Category Management (GET, POST, PATCH, DELETE /api/admin/categories)
router.get('/categories', adminListCategories)
router.post('/categories', validate(categorySchema), adminCreateCategory)
router.patch('/categories/:id', validate(updateCategorySchema), adminUpdateCategory)
router.delete('/categories/:id', adminDeleteCategory)

// Order Management (GET, PATCH /api/admin/orders/:id)
router.get('/orders', listOrders)
router.patch('/orders/:id', updateOrderStatus)
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus)

// Coupon Management (GET, POST, PATCH, DELETE /api/admin/coupons)
router.get('/coupons', adminListCoupons)
router.post('/coupons', validate(createCouponSchema), adminCreateCoupon)
router.patch('/coupons/:id', validate(updateCouponSchema), adminUpdateCoupon)
router.delete('/coupons/:id', adminDeleteCoupon)

// Patron Directory, Customer Orders & Login Activity (GET /api/admin/customers & /login-activity)
router.get('/customers', adminListCustomers)
router.get('/customers/:id', adminGetCustomerById)
router.get('/customers/:id/orders', adminGetCustomerOrders)
router.get('/login-activity', adminGetLoginActivity)

// Concierge Messages / Inquiries (GET, PATCH /api/admin/messages & /inquiries)
router.get('/messages', adminListInquiries)
router.patch('/messages/:id', adminUpdateInquiryStatus)
router.get('/inquiries', adminListInquiries)
router.patch('/inquiries/:id/status', adminUpdateInquiryStatus)

export default router

