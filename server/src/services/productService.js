import { Prisma } from '@prisma/client'
import { prisma, dbStatus } from '../config/db.js'
import { PRODUCTS, DEPARTMENTS, CATEGORIES } from '../data/products.js'

export function formatDatabaseProduct(p) {
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
    categoryId: p.categoryId,
    category: p.category?.name || 'Tailoring',
    department: p.category?.department || 'Women',
    price: Number(p.basePrice || p.price || 0),
    originalPrice: p.comparisonPrice ? Number(p.comparisonPrice) : null,
    inStock: p.isActive !== false && (variants.length === 0 || totalStock > 0),
    stock: variants.length > 0 ? totalStock : (p.stock || 10),
    isNew: Boolean(p.isNew),
    isFeatured: Boolean(p.isFeatured),
    isSale: Boolean(p.comparisonPrice && Number(p.comparisonPrice) > Number(p.basePrice)),
    tag: p.tag,
    materials: p.materials,
    careInstructions: p.careInstructions,
    details: p.details || [],
    images: images.length > 0 ? images : (Array.isArray(p.images) ? p.images : []),
    sizes: sizes.length > 0 ? sizes : (p.sizes || ['One Size']),
    colors: colors.length > 0 ? colors : (p.colors || []),
    variants: variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stockQuantity: v.stockQuantity,
      image: v.image,
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

export const productService = {
  /**
   * Retrieves products with pagination, search, category, size, color, price range, sale, and sorting
   * Only active products are returned to public users.
   */
  async list({
    page = 1,
    limit = 12,
    department,
    category,
    search,
    size,
    color,
    minPrice,
    maxPrice,
    isSale,
    featured,
    isNew,
    sort = 'featured',
    includeInactive = false,
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12))
    const skip = (pageNum - 1) * limitNum

    // 1. Prisma Relational Query if Database is Connected
    if (dbStatus.isConnected && prisma) {
      try {
        const where = {}
        if (!includeInactive) {
          where.isActive = true
        }

        if (department && department !== 'All') {
          where.category = { department: { equals: department, mode: 'insensitive' } }
        }

        if (category && category !== 'All') {
          where.category = {
            ...where.category,
            OR: [
              { name: { equals: category, mode: 'insensitive' } },
              { slug: { equals: category.toLowerCase() } },
            ],
          }
        }

        if (featured === true || featured === 'true') {
          where.isFeatured = true
        }

        if (isNew === true || isNew === 'true') {
          where.isNew = true
        }

        if (isSale === true || isSale === 'true') {
          where.comparisonPrice = { not: null }
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
          where.basePrice = {}
          if (minPrice !== undefined) where.basePrice.gte = new Prisma.Decimal(minPrice)
          if (maxPrice !== undefined) where.basePrice.lte = new Prisma.Decimal(maxPrice)
        }

        if (search) {
          const s = search.trim()
          where.OR = [
            { name: { contains: s, mode: 'insensitive' } },
            { description: { contains: s, mode: 'insensitive' } },
            { subtitle: { contains: s, mode: 'insensitive' } },
            { category: { name: { contains: s, mode: 'insensitive' } } },
          ]
        }

        if (size || color) {
          where.variants = {
            some: {
              ...(size ? { size: { equals: size, mode: 'insensitive' } } : {}),
              ...(color ? { color: { equals: color, mode: 'insensitive' } } : {}),
            },
          }
        }

        const orderBy = []
        if (sort === 'price-asc') orderBy.push({ basePrice: 'asc' })
        else if (sort === 'price-desc') orderBy.push({ basePrice: 'desc' })
        else if (sort === 'newest') orderBy.push({ createdAt: 'desc' })
        else if (sort === 'popularity' || sort === 'featured') {
          orderBy.push({ isFeatured: 'desc' }, { createdAt: 'desc' })
        } else {
          orderBy.push({ createdAt: 'desc' })
        }

        const [total, dbProducts] = await Promise.all([
          prisma.product.count({ where }),
          prisma.product.findMany({
            where,
            include: {
              category: true,
              images: { orderBy: { displayOrder: 'asc' } },
              variants: true,
            },
            orderBy,
            skip,
            take: limitNum,
          }),
        ])

        const items = dbProducts.map(formatDatabaseProduct)
        const totalPages = Math.ceil(total / limitNum) || 1

        return {
          items,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasMore: pageNum < totalPages,
          },
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
          source: 'database',
        }
      } catch (err) {
        console.warn('[ProductService] Database query fallback:', err.message)
      }
    }

    // 2. In-Memory Catalog Fallback
    let filtered = [...PRODUCTS]

    if (!includeInactive) {
      filtered = filtered.filter((p) => p.inStock !== false)
    }

    if (department && department !== 'All') {
      filtered = filtered.filter((p) => p.department.toLowerCase() === department.toLowerCase())
    }

    if (category && category !== 'All') {
      const catLower = category.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase() === catLower ||
          p.subcategory?.toLowerCase() === catLower ||
          p.category.toLowerCase().replace(/\s+/g, '-') === catLower
      )
    }

    if (featured === true || featured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured)
    }

    if (isNew === true || isNew === 'true') {
      filtered = filtered.filter((p) => p.isNew)
    }

    if (isSale === true || isSale === 'true') {
      filtered = filtered.filter((p) => Boolean(p.isSale || p.originalPrice))
    }

    if (minPrice !== undefined && minPrice !== null) {
      filtered = filtered.filter((p) => p.price >= parseFloat(minPrice))
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice))
    }

    if (size) {
      filtered = filtered.filter((p) => p.sizes && p.sizes.some((s) => s.toLowerCase() === size.toLowerCase()))
    }

    if (color) {
      filtered = filtered.filter(
        (p) => p.colors && p.colors.some((c) => c.name.toLowerCase() === color.toLowerCase())
      )
    }

    if (search) {
      const q = search.toLowerCase().trim()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sort === 'newest') {
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    } else if (sort === 'popularity' || sort === 'featured') {
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }

    const total = filtered.length
    const paginatedItems = filtered.slice(skip, skip + limitNum)
    const totalPages = Math.ceil(total / limitNum) || 1

    return {
      items: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasMore: pageNum < totalPages,
      source: 'catalog_cache',
    }
  },

  /**
   * Retrieves single product by ID or slug
   */
  async getById(id, includeInactive = false) {
    if (dbStatus.isConnected && prisma) {
      try {
        const where = {
          OR: [{ id }, { slug: id }],
        }
        if (!includeInactive) {
          where.isActive = true
        }

        const product = await prisma.product.findFirst({
          where,
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
   * Retrieves single product specifically by unique slug
   */
  async getBySlug(slug, includeInactive = false) {
    return this.getById(slug, includeInactive)
  },

  /**
   * Retrieves categories with product counts
   */
  async getCategories() {
    if (dbStatus.isConnected && prisma) {
      try {
        const categories = await prisma.category.findMany({
          include: {
            _count: {
              select: { products: { where: { isActive: true } } },
            },
          },
          orderBy: { name: 'asc' },
        })

        if (categories && categories.length > 0) {
          const formatted = categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            department: c.department,
            description: c.description,
            image: c.image,
            productsCount: c._count?.products || 0,
          }))

          return {
            categories: formatted,
            departments: [...new Set(categories.map((c) => c.department))],
            source: 'database',
          }
        }
      } catch (err) {
        console.warn('[ProductService] Categories DB fallback:', err.message)
      }
    }

    // In-memory categories with computed counts
    const counts = new Map()
    for (const p of PRODUCTS) {
      const cat = p.category
      counts.set(cat, (counts.get(cat) || 0) + 1)
    }

    const categoriesList = (CATEGORIES || ['Coats', 'Tailoring', 'Dresses', 'Knitwear', 'Trousers', 'Leather Goods']).map(
      (name, idx) => ({
        id: `cat-${idx + 1}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        department: name === 'Leather Goods' || name === 'Accessories' ? 'Accessories' : 'Women',
        description: `Curated ${name.toLowerCase()} monographs by AUREVA Atelier.`,
        image: null,
        productsCount: counts.get(name) || 0,
      })
    )

    return {
      categories: categoriesList,
      departments: DEPARTMENTS || ['Women', 'Men', 'Accessories'],
      source: 'catalog_cache',
    }
  },

  /**
   * Admin: Create new product transactionally
   */
  async create(data) {
    const slug = data.slug || data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + `-${Date.now().toString(36)}`

    if (dbStatus.isConnected && prisma) {
      try {
        const created = await prisma.$transaction(async (tx) => {
          const prod = await tx.product.create({
            data: {
              name: data.name,
              slug,
              subtitle: data.subtitle || null,
              description: data.description,
              categoryId: data.categoryId,
              basePrice: new Prisma.Decimal(data.basePrice),
              comparisonPrice: data.comparisonPrice ? new Prisma.Decimal(data.comparisonPrice) : null,
              isActive: data.isActive !== undefined ? data.isActive : true,
              isFeatured: Boolean(data.isFeatured),
              isNew: Boolean(data.isNew),
              tag: data.tag || null,
              materials: data.materials || null,
              careInstructions: data.careInstructions || null,
              details: data.details || [],
            },
          })

          if (data.images && data.images.length > 0) {
            for (let i = 0; i < data.images.length; i++) {
              await tx.productImage.create({
                data: {
                  productId: prod.id,
                  imageUrl: data.images[i].imageUrl || data.images[i],
                  altText: data.images[i].altText || `${data.name} Angle ${i + 1}`,
                  displayOrder: data.images[i].displayOrder || i,
                },
              })
            }
          }

          if (data.variants && data.variants.length > 0) {
            for (const v of data.variants) {
              const sku = v.sku || `AUR-${prod.id.slice(0, 6).toUpperCase()}-${v.size.replace(/\s+/g, '').toUpperCase()}-${v.color.slice(0, 3).toUpperCase()}`
              await tx.productVariant.create({
                data: {
                  productId: prod.id,
                  size: v.size,
                  color: v.color,
                  sku,
                  stockQuantity: v.stockQuantity || 0,
                  image: v.image || null,
                },
              })
            }
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

    const productRecord = {
      ...data,
      id: `aur-${Date.now().toString(36)}`,
      slug,
      price: data.basePrice,
      originalPrice: data.comparisonPrice,
      inStock: data.isActive !== false,
      stock: (data.variants || []).reduce((acc, v) => acc + (v.stockQuantity || 0), 0) || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
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
        if (updates.name !== undefined) data.name = updates.name
        if (updates.slug !== undefined) data.slug = updates.slug
        if (updates.subtitle !== undefined) data.subtitle = updates.subtitle
        if (updates.description !== undefined) data.description = updates.description
        if (updates.categoryId !== undefined) data.categoryId = updates.categoryId
        if (updates.basePrice !== undefined) data.basePrice = new Prisma.Decimal(updates.basePrice)
        if (updates.comparisonPrice !== undefined) {
          data.comparisonPrice = updates.comparisonPrice ? new Prisma.Decimal(updates.comparisonPrice) : null
        }
        if (updates.isActive !== undefined) data.isActive = Boolean(updates.isActive)
        if (updates.isFeatured !== undefined) data.isFeatured = Boolean(updates.isFeatured)
        if (updates.isNew !== undefined) data.isNew = Boolean(updates.isNew)
        if (updates.tag !== undefined) data.tag = updates.tag
        if (updates.materials !== undefined) data.materials = updates.materials
        if (updates.careInstructions !== undefined) data.careInstructions = updates.careInstructions
        if (updates.details !== undefined) data.details = updates.details

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
        price: updates.basePrice !== undefined ? updates.basePrice : PRODUCTS[index].price,
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
