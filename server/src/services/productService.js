import { Prisma } from '@prisma/client'
import { prisma, dbStatus } from '../config/db.js'
import { PRODUCTS, DEPARTMENTS, CATEGORIES } from '../data/products.js'

function formatDatabaseProduct(p) {
  if (!p) return null
  const images = (p.images || []).map((img) => img.imageUrl || img)
  const variants = p.variants || []
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))]
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))].map((name) => ({ name }))
  const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    subtitle: p.subtitle,
    description: p.description,
    category: p.category?.name || 'Tailoring',
    department: p.category?.department || 'Women',
    price: Number(p.basePrice || p.price || 0),
    originalPrice: p.comparisonPrice ? Number(p.comparisonPrice) : null,
    inStock: p.isActive !== false && (variants.length === 0 || totalStock > 0),
    stock: variants.length > 0 ? totalStock : (p.stock || 10),
    isNew: Boolean(p.isNew),
    isFeatured: Boolean(p.isFeatured),
    tag: p.tag,
    images: images.length > 0 ? images : (Array.isArray(p.images) ? p.images : []),
    sizes: sizes.length > 0 ? sizes : (p.sizes || ['One Size']),
    colors: colors.length > 0 ? colors : (p.colors || []),
    materials: p.materials,
    careInstructions: p.careInstructions,
    details: p.details || [],
    variants: p.variants || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

export const productService = {
  /**
   * Retrieves products with filtering, search, and sorting
   */
  async list({ department, category, search, featured, isNew, sort = 'featured', maxPrice, minPrice } = {}) {
    // 1. Prisma Relational Query if Database is Connected
    if (dbStatus.isConnected && prisma) {
      try {
        const where = { isActive: true }

        if (department && department !== 'All') {
          where.category = { department: { equals: department, mode: 'insensitive' } }
        }
        if (category && category !== 'All') {
          where.category = {
            OR: [
              { name: { equals: category, mode: 'insensitive' } },
              { slug: { equals: category.toLowerCase() } },
            ],
          }
        }
        if (featured === 'true' || featured === true) {
          where.isFeatured = true
        }
        if (isNew === 'true' || isNew === true) {
          where.isNew = true
        }
        if (minPrice || maxPrice) {
          where.basePrice = {}
          if (minPrice) where.basePrice.gte = new Prisma.Decimal(minPrice)
          if (maxPrice) where.basePrice.lte = new Prisma.Decimal(maxPrice)
        }
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ]
        }

        const orderBy = []
        if (sort === 'price-asc') orderBy.push({ basePrice: 'asc' })
        else if (sort === 'price-desc') orderBy.push({ basePrice: 'desc' })
        else if (sort === 'newest') orderBy.push({ createdAt: 'desc' })
        else if (sort === 'name') orderBy.push({ name: 'asc' })

        const dbProducts = await prisma.product.findMany({
          where,
          include: {
            category: true,
            images: { orderBy: { displayOrder: 'asc' } },
            variants: true,
          },
          orderBy: orderBy.length > 0 ? orderBy : undefined,
        })

        if (dbProducts && dbProducts.length > 0) {
          const items = dbProducts.map(formatDatabaseProduct)
          return {
            items,
            total: items.length,
            source: 'database',
          }
        }
      } catch (err) {
        console.warn('[ProductService] Database query fallback:', err.message)
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
   * Retrieves single product by ID or slug
   */
  async getById(id) {
    if (dbStatus.isConnected && prisma) {
      try {
        const product = await prisma.product.findFirst({
          where: {
            OR: [{ id }, { slug: id }],
          },
          include: {
            category: true,
            images: { orderBy: { displayOrder: 'asc' } },
            variants: true,
          },
        })
        if (product) return { product: formatDatabaseProduct(product), source: 'database' }
      } catch (err) {
        console.warn('[ProductService] Fallback to static record:', err.message)
      }
    }

    const product = PRODUCTS.find((p) => p.id === id || p.slug === id) || null
    return { product, source: 'catalog_cache' }
  },

  /**
   * Retrieves taxonomy departments and categories
   */
  async getCategories() {
    if (dbStatus.isConnected && prisma) {
      try {
        const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } })
        if (cats && cats.length > 0) {
          return {
            departments: [...new Set(cats.map((c) => c.department))],
            categories: cats.map((c) => c.name),
            categoryRecords: cats,
          }
        }
      } catch (err) {
        console.warn('[ProductService] Categories DB fallback:', err.message)
      }
    }

    return {
      departments: DEPARTMENTS || ['Women', 'Men', 'Accessories'],
      categories: CATEGORIES || ['Coats', 'Tailoring', 'Dresses', 'Knitwear', 'Trousers', 'Leather Goods'],
    }
  },

  /**
   * Admin: Create new product transactionally
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
        // Find or create category
        const catSlug = (productData.category || 'tailoring').toLowerCase().replace(/\s+/g, '-')
        const category = await prisma.category.upsert({
          where: { slug: catSlug },
          update: { department: productData.department || 'Women' },
          create: {
            name: productData.category || 'Tailoring',
            slug: catSlug,
            department: productData.department || 'Women',
          },
        })

        const basePrice = new Prisma.Decimal(productRecord.price)
        const comparisonPrice = productRecord.originalPrice ? new Prisma.Decimal(productRecord.originalPrice) : null

        // Transaction: Product + Images + Default Variant
        const created = await prisma.$transaction(async (tx) => {
          const prod = await tx.product.create({
            data: {
              name: productRecord.name,
              slug: `${catSlug}-${Date.now().toString(36)}`,
              subtitle: productRecord.subtitle || null,
              description: productRecord.description || '',
              categoryId: category.id,
              basePrice,
              comparisonPrice,
              isActive: Boolean(productRecord.inStock),
              isNew: Boolean(productRecord.isNew),
              isFeatured: Boolean(productRecord.isFeatured),
              tag: productRecord.tag || null,
              materials: productRecord.materials || null,
              careInstructions: productRecord.careInstructions || null,
              details: productRecord.details || [],
            },
          })

          if (productRecord.images && productRecord.images.length > 0) {
            for (let i = 0; i < productRecord.images.length; i++) {
              await tx.productImage.create({
                data: {
                  productId: prod.id,
                  imageUrl: productRecord.images[i],
                  displayOrder: i,
                },
              })
            }
          }

          // Create base variants
          const sizes = productRecord.sizes && productRecord.sizes.length > 0 ? productRecord.sizes : ['One Size']
          for (const s of sizes) {
            await tx.productVariant.create({
              data: {
                productId: prod.id,
                size: s,
                color: 'Default',
                sku: `AUR-${prod.id.slice(0, 6).toUpperCase()}-${s}`,
                stockQuantity: productRecord.stock || 10,
              },
            })
          }

          return tx.product.findUnique({
            where: { id: prod.id },
            include: { category: true, images: true, variants: true },
          })
        })

        return { product: formatDatabaseProduct(created), source: 'database' }
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
        const data = {}
        if (updates.name) data.name = updates.name
        if (updates.subtitle !== undefined) data.subtitle = updates.subtitle
        if (updates.description) data.description = updates.description
        if (updates.price) data.basePrice = new Prisma.Decimal(updates.price)
        if (updates.originalPrice !== undefined) {
          data.comparisonPrice = updates.originalPrice ? new Prisma.Decimal(updates.originalPrice) : null
        }
        if (updates.inStock !== undefined) data.isActive = Boolean(updates.inStock)

        const updated = await prisma.product.update({
          where: { id },
          data,
          include: { category: true, images: true, variants: true },
        })
        return { product: formatDatabaseProduct(updated), source: 'database' }
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
