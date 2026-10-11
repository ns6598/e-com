import { prisma, dbStatus } from '../config/db.js'
import { PRODUCTS, DEPARTMENTS, CATEGORIES } from '../data/products.js'

export const productService = {
  /**
   * Retrieves products with filtering, search, and sorting
   */
  async list({ department, category, search, featured, isNew, sort = 'featured', maxPrice, minPrice } = {}) {
    // 1. Prisma Query if Database is Connected
    if (dbStatus.isConnected && prisma) {
      try {
        const where = {}

        if (department && department !== 'All') {
          where.department = { equals: department, mode: 'insensitive' }
        }
        if (category && category !== 'All') {
          where.category = { equals: category, mode: 'insensitive' }
        }
        if (featured === 'true' || featured === true) {
          where.isFeatured = true
        }
        if (isNew === 'true' || isNew === true) {
          where.isNew = true
        }
        if (minPrice || maxPrice) {
          where.price = {}
          if (minPrice) where.price.gte = parseFloat(minPrice)
          if (maxPrice) where.price.lte = parseFloat(maxPrice)
        }
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ]
        }

        const orderBy = []
        if (sort === 'price-asc') orderBy.push({ price: 'asc' })
        else if (sort === 'price-desc') orderBy.push({ price: 'desc' })
        else if (sort === 'newest') orderBy.push({ createdAt: 'desc' })
        else if (sort === 'name') orderBy.push({ name: 'asc' })

        const dbProducts = await prisma.product.findMany({
          where,
          orderBy: orderBy.length > 0 ? orderBy : undefined,
        })

        if (dbProducts && dbProducts.length > 0) {
          return {
            items: dbProducts,
            total: dbProducts.length,
            source: 'database',
          }
        }
      } catch (err) {
        console.warn('[ProductService] Database fallback activated:', err.message)
      }
    }

    // 2. In-Memory Catalog Fallback
    let items = [...PRODUCTS]

    if (department && department !== 'All') {
      items = items.filter((p) => p.department.toLowerCase() === department.toLowerCase())
    }
    if (category && category !== 'All') {
      items = items.filter(
        (p) =>
          p.category.toLowerCase() === category.toLowerCase() ||
          p.subcategory?.toLowerCase() === category.toLowerCase()
      )
    }
    if (featured === 'true' || featured === true) {
      items = items.filter((p) => p.isFeatured)
    }
    if (isNew === 'true' || isNew === true) {
      items = items.filter((p) => p.isNew)
    }
    if (maxPrice) {
      items = items.filter((p) => p.price <= parseFloat(maxPrice))
    }
    if (minPrice) {
      items = items.filter((p) => p.price >= parseFloat(minPrice))
    }
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sort === 'price-asc') {
      items.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      items.sort((a, b) => b.price - a.price)
    } else if (sort === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name))
    }

    return {
      items,
      total: items.length,
      source: 'catalog_cache',
    }
  },

  /**
   * Retrieves single product by ID
   */
  async getById(id) {
    if (dbStatus.isConnected && prisma) {
      try {
        const product = await prisma.product.findUnique({ where: { id } })
        if (product) return { product, source: 'database' }
      } catch (err) {
        console.warn('[ProductService] Fallback to static record:', err.message)
      }
    }

    const product = PRODUCTS.find((p) => p.id === id) || null
    return { product, source: 'catalog_cache' }
  },

  /**
   * Retrieves taxonomy departments and categories
   */
  getCategories() {
    return {
      departments: DEPARTMENTS || ['Women', 'Men', 'Accessories'],
      categories: CATEGORIES || ['Coats', 'Tailoring', 'Dresses', 'Knitwear', 'Trousers', 'Leather Goods'],
    }
  },

  /**
   * Admin: Create new product
   */
  async create(productData) {
    const id = productData.id || `aur-${Date.now().toString(36)}`
    const productRecord = {
      ...productData,
      id,
      inStock: productData.inStock !== undefined ? productData.inStock : true,
      stock: productData.stock !== undefined ? parseInt(productData.stock, 10) : 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (dbStatus.isConnected && prisma) {
      try {
        const created = await prisma.product.create({
          data: {
            id,
            name: productRecord.name,
            subtitle: productRecord.subtitle || null,
            description: productRecord.description || '',
            category: productRecord.category || 'Tailoring',
            department: productRecord.department || 'Women',
            price: parseFloat(productRecord.price),
            originalPrice: productRecord.originalPrice ? parseFloat(productRecord.originalPrice) : null,
            inStock: Boolean(productRecord.inStock),
            stock: productRecord.stock,
            isNew: Boolean(productRecord.isNew),
            isFeatured: Boolean(productRecord.isFeatured),
            tag: productRecord.tag || null,
            images: productRecord.images || [],
            sizes: productRecord.sizes || [],
            colors: productRecord.colors || [],
            materials: productRecord.materials || null,
            careInstructions: productRecord.careInstructions || null,
            details: productRecord.details || [],
          },
        })
        return { product: created, source: 'database' }
      } catch (err) {
        console.warn('[ProductService] Database create fallback:', err.message)
      }
    }

    // In-memory catalog update
    PRODUCTS.unshift(productRecord)
    return { product: productRecord, source: 'memory_store' }
  },

  /**
   * Admin: Update product
   */
  async update(id, updates) {
    if (dbStatus.isConnected && prisma) {
      try {
        const updated = await prisma.product.update({
          where: { id },
          data: {
            ...updates,
            price: updates.price ? parseFloat(updates.price) : undefined,
            originalPrice: updates.originalPrice ? parseFloat(updates.originalPrice) : undefined,
            stock: updates.stock !== undefined ? parseInt(updates.stock, 10) : undefined,
            updatedAt: new Date(),
          },
        })
        return { product: updated, source: 'database' }
      } catch (err) {
        console.warn('[ProductService] Database update fallback:', err.message)
      }
    }

    const index = PRODUCTS.findIndex((p) => p.id === id)
    if (index !== -1) {
      PRODUCTS[index] = {
        ...PRODUCTS[index],
        ...updates,
        price: updates.price !== undefined ? parseFloat(updates.price) : PRODUCTS[index].price,
        stock: updates.stock !== undefined ? parseInt(updates.stock, 10) : PRODUCTS[index].stock,
        updatedAt: new Date().toISOString(),
      }
      return { product: PRODUCTS[index], source: 'memory_store' }
    }

    return { product: null }
  },

  /**
   * Admin: Delete product
   */
  async delete(id) {
    if (dbStatus.isConnected && prisma) {
      try {
        await prisma.product.delete({ where: { id } })
        return { success: true, source: 'database' }
      } catch (err) {
        console.warn('[ProductService] Database delete fallback:', err.message)
      }
    }

    const index = PRODUCTS.findIndex((p) => p.id === id)
    if (index !== -1) {
      const removed = PRODUCTS.splice(index, 1)[0]
      return { success: true, product: removed, source: 'memory_store' }
    }

    return { success: false }
  },
}

export default productService

