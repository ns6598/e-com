import api from './api'
import { PRODUCTS } from '../data/products'

/**
 * Generate a clean URL-friendly slug from a product title
 */
function slugify(text) {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

/**
 * Normalized offline/client catalog dataset derived from centralized PRODUCTS
 */
const CATALOG_ITEMS = PRODUCTS.map((p) => ({
  ...p,
  slug: p.slug || slugify(p.name),
  price: Number(p.price) || 0,
  originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
  inStock: p.inStock !== false,
  isFeatured: Boolean(p.isFeatured),
  isNew: Boolean(p.isNew),
  isSale: Boolean(p.isSale || (p.originalPrice && p.originalPrice > p.price)),
}))

/**
 * In-memory search, filter, sort, and pagination engine for offline & serverless client fallback
 */
function filterLocalProducts(params = {}) {
  let filtered = [...CATALOG_ITEMS]

  // Search keyword filter
  if (params.search) {
    const q = params.search.toLowerCase().trim()
    filtered = filtered.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.subtitle?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q)
    )
  }

  // Department filter (Women, Men, Unisex)
  if (params.department && params.department !== 'All') {
    const dept = params.department.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.department?.toLowerCase() === dept ||
        p.department?.toLowerCase() === 'unisex' ||
        dept === 'all'
    )
  }

  // Category filter
  if (params.category && params.category !== 'All') {
    const cat = params.category.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.category?.toLowerCase() === cat ||
        p.subcategory?.toLowerCase() === cat
    )
  }

  // Size filter
  if (params.size && params.size !== 'All') {
    const sz = params.size.toLowerCase()
    filtered = filtered.filter((p) =>
      p.sizes?.some((s) => s.toLowerCase() === sz)
    )
  }

  // Color filter
  if (params.color && params.color !== 'All') {
    const clr = params.color.toLowerCase()
    filtered = filtered.filter((p) =>
      p.colors?.some((c) => (typeof c === 'string' ? c : c.name)?.toLowerCase() === clr)
    )
  }

  // Price range filters
  if (params.minPrice) {
    filtered = filtered.filter((p) => p.price >= Number(params.minPrice))
  }
  if (params.maxPrice) {
    filtered = filtered.filter((p) => p.price <= Number(params.maxPrice))
  }

  // Sale filter
  if (params.sale === 'true' || params.isSale === 'true') {
    filtered = filtered.filter((p) => p.isSale)
  }

  // New arrivals filter
  if (params.isNew === 'true' || params.filter === 'new' || params.filter === 'new-arrivals') {
    filtered = filtered.filter((p) => p.isNew)
  }

  // In-stock filter
  if (params.inStock === 'true') {
    filtered = filtered.filter((p) => p.inStock)
  }

  // Sorting
  const sort = params.sort || 'featured'
  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price)
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price)
  } else if (sort === 'newest') {
    filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
  } else if (sort === 'rating' || sort === 'bestselling') {
    filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0))
  } else {
    // Featured default
    filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
  }

  // Pagination
  const page = Math.max(1, parseInt(params.page, 10) || 1)
  const limit = Math.max(1, parseInt(params.limit, 10) || 12)
  const total = filtered.length
  const totalPages = Math.ceil(total / limit) || 1
  const startIndex = (page - 1) * limit
  const paginatedItems = filtered.slice(startIndex, startIndex + limit)

  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  }
}

/**
 * AUREVA Atelier Product Service
 * Dual-engine service: queries PostgreSQL Express REST API when reachable,
 * with instantaneous, zero-downtime client-side catalog fallback when deployed statically or offline.
 */
export const productService = {
  /**
   * Fetch paginated products with server-side filtering, sorting and search
   * Seamlessly falls back to client catalog if backend API is unreachable.
   * @param {Object} params - Query parameters
   * @returns {Promise<{ items: Array, pagination: Object }>}
   */
  getProducts: async (params = {}) => {
    const cleanParams = {}
    Object.keys(params).forEach((key) => {
      const val = params[key]
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        cleanParams[key] = val
      }
    })

    try {
      const response = await api.get('/products', { params: cleanParams })
      if (
        response &&
        response.success &&
        response.data &&
        Array.isArray(response.data.items) &&
        response.data.items.length > 0
      ) {
        return {
          items: response.data.items,
          pagination: response.data.pagination || {
            page: 1,
            limit: cleanParams.limit || 12,
            total: response.data.items.length,
            totalPages: 1,
            hasMore: false,
          },
        }
      }
    } catch (err) {
      console.warn('[productService] Backend API note; using client catalog fallback:', err.message)
    }

    // Gracefully return local catalog matching parameters
    return filterLocalProducts(cleanParams)
  },

  /**
   * Alias for backwards compatibility with earlier components
   */
  getAll: async (params = {}) => {
    const result = await productService.getProducts(params)
    return result.items
  },

  /**
   * Fetch single product by unique ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${encodeURIComponent(id)}`)
      if (response && response.success && response.data) {
        return response.data
      }
    } catch (err) {
      console.warn(`[productService] API getProductById(${id}) note; searching client catalog:`, err.message)
    }

    const cleanId = String(id).toLowerCase()
    const found = CATALOG_ITEMS.find((p) => String(p.id).toLowerCase() === cleanId)
    if (found) return found

    throw new Error(`Product ${id} not found in catalog`)
  },

  /**
   * Fetch single product by unique slug
   * @param {string} slug
   * @returns {Promise<Object>}
   */
  getProductBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/slug/${encodeURIComponent(slug)}`)
      if (response && response.success && response.data) {
        return response.data
      }
    } catch (err) {
      console.warn(`[productService] API getProductBySlug(${slug}) note; searching client catalog:`, err.message)
    }

    const cleanSlug = String(slug).toLowerCase()
    const found = CATALOG_ITEMS.find(
      (p) =>
        String(p.slug).toLowerCase() === cleanSlug ||
        String(p.id).toLowerCase() === cleanSlug ||
        slugify(p.name) === cleanSlug
    )
    if (found) return found

    throw new Error(`Product '${slug}' not found in catalog`)
  },

  /**
   * Flexible lookup supporting both ID and slug parameters with client fallback
   * @param {string} identifier
   * @returns {Promise<Object>}
   */
  getByIdOrSlug: async (identifier) => {
    if (!identifier) throw new Error('Product identifier is required')

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
    if (isUuid) {
      try {
        return await productService.getProductById(identifier)
      } catch {
        return await productService.getProductBySlug(identifier)
      }
    } else {
      try {
        return await productService.getProductBySlug(identifier)
      } catch {
        return await productService.getProductById(identifier)
      }
    }
  },
}

export default productService
