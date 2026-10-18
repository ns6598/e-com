import api from './api'

/**
 * AUREVA Atelier Administrative & Curator Service
 * Securely interfaces with Express `/api/admin/*` endpoints guarded by requireAdmin middleware.
 */
export const adminService = {
  // 1. Analytics & Executive Dashboard
  getStats: async () => {
    const res = await api.get('/admin/stats')
    return res?.data || null
  },

  // 2. Product Management
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await api.get(`/admin/products${query ? `?${query}` : ''}`)
    return res?.data?.items || res?.data || []
  },

  createProduct: async (productData) => {
    const res = await api.post('/admin/products', productData)
    return res?.data || null
  },

  updateProduct: async (id, updates) => {
    const res = await api.patch(`/admin/products/${encodeURIComponent(id)}`, updates)
    return res?.data || null
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/admin/products/${encodeURIComponent(id)}`)
    return res?.success || false
  },

  // 3. Variant & Stock Control
  addVariant: async (productId, variantData) => {
    const res = await api.post(`/admin/products/${encodeURIComponent(productId)}/variants`, variantData)
    return res?.data || null
  },

  updateVariantStock: async (variantId, stockQuantity) => {
    const res = await api.patch(`/admin/variants/${encodeURIComponent(variantId)}/stock`, { stockQuantity })
    return res?.data || null
  },

  // 4. Categories Management
  getCategories: async () => {
    const res = await api.get('/admin/categories')
    return res?.data || []
  },

  createCategory: async (categoryData) => {
    const res = await api.post('/admin/categories', categoryData)
    return res?.data || null
  },

  updateCategory: async (id, updates) => {
    const res = await api.patch(`/admin/categories/${encodeURIComponent(id)}`, updates)
    return res?.data || null
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/admin/categories/${encodeURIComponent(id)}`)
    return res?.success || false
  },

  // 5. Orders & Dispatch Protocols
  getOrders: async () => {
    const res = await api.get('/admin/orders')
    return res?.data || []
  },

  updateOrderStatus: async (id, status, paymentStatus) => {
    const payload = {}
    if (status) payload.status = status
    if (paymentStatus) payload.paymentStatus = paymentStatus
    const res = await api.patch(`/admin/orders/${encodeURIComponent(id)}/status`, payload)
    return res?.data || null
  },

  // 6. Privilege Coupons
  getCoupons: async () => {
    const res = await api.get('/admin/coupons')
    return res?.data || []
  },

  createCoupon: async (couponData) => {
    const res = await api.post('/admin/coupons', couponData)
    return res?.data || null
  },

  updateCoupon: async (id, updates) => {
    const res = await api.patch(`/admin/coupons/${encodeURIComponent(id)}`, updates)
    return res?.data || null
  },

  deleteCoupon: async (id) => {
    const res = await api.delete(`/admin/coupons/${encodeURIComponent(id)}`)
    return res?.success || false
  },

  // 7. Customers & Inquiries
  getCustomers: async () => {
    const res = await api.get('/admin/customers')
    return res?.data || []
  },

  getInquiries: async () => {
    const res = await api.get('/admin/inquiries')
    return res?.data || []
  },

  updateInquiryStatus: async (id, status) => {
    const res = await api.patch(`/admin/inquiries/${encodeURIComponent(id)}/status`, { status })
    return res?.data || null
  },
}

export default adminService
