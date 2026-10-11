import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PRODUCTS } from '../src/data/products.js'

const prisma = new PrismaClient()

// Slugify helper
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

async function main() {
  console.log('[AUREVA Seeder] Initiating relational database seed...')

  // -------------------------------------------------------------------------
  // 1. Seed Categories
  // -------------------------------------------------------------------------
  console.log('[AUREVA Seeder] Seeding taxonomy categories...')
  const CATEGORY_DEFINITIONS = [
    {
      name: 'Coats',
      slug: 'coats',
      department: 'Women',
      description: 'Architectural outerwear, double-faced wool envelopes, and structured winter monoliths.',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: 'Tailoring',
      slug: 'tailoring',
      department: 'Women',
      description: 'Precision-cut blazers, deconstructed shirting, and sculpted sartorial statements.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: 'Dresses',
      slug: 'dresses',
      department: 'Women',
      description: 'Bias-cut evening gowns, structured column silks, and fluid nocturnal silhouettes.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: 'Knitwear',
      slug: 'knitwear',
      department: 'Women',
      description: 'Gauge-calibrated cashmere, rib-knit architectural turtlenecks, and raw merino layers.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: 'Trousers',
      slug: 'trousers',
      department: 'Women',
      description: 'Wide-leg wool twill, pleated column silhouettes, and razor-sharp crease tailoring.',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: 'Leather Goods',
      slug: 'leather-goods',
      department: 'Accessories',
      description: 'Tuscan vegetable-tanned bridle leather, sculpted clutches, and raw brass hardware.',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: "Men's Tailoring",
      slug: 'mens-tailoring',
      department: 'Men',
      description: 'Structured double-breasted overcoats, heavy poplin shirting, and wool gabardine.',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      department: 'Accessories',
      description: 'Cashmere foulards, sculpted leather belts, and bespoke atelier appointments.',
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=85',
    },
  ]

  const categoryMap = new Map()

  for (const cat of CATEGORY_DEFINITIONS) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        department: cat.department,
        description: cat.description,
        image: cat.image,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        department: cat.department,
        description: cat.description,
        image: cat.image,
      },
    })
    categoryMap.set(cat.name.toLowerCase(), record)
    categoryMap.set(cat.slug, record)
  }
  console.log(`[AUREVA Seeder] Seeded ${CATEGORY_DEFINITIONS.length} taxonomy categories.`)

  // -------------------------------------------------------------------------
  // 2. Seed Users: Patron & Development Admin
  // -------------------------------------------------------------------------
  console.log('[AUREVA Seeder] Seeding authentication patrons & administrators...')

  // Demo Patron User
  const patronPassword = await bcrypt.hash('AurevaSalon2026!', 10)
  const patron = await prisma.user.upsert({
    where: { email: 'patron@aureva-studios.demo' },
    update: {
      name: 'Elena Rostova',
      role: 'CUSTOMER',
    },
    create: {
      email: 'patron@aureva-studios.demo',
      password: patronPassword,
      name: 'Elena Rostova',
      role: 'CUSTOMER',
    },
  })

  // Add default address for Patron
  await prisma.address.deleteMany({ where: { userId: patron.id } })
  await prisma.address.create({
    data: {
      userId: patron.id,
      name: 'Elena Rostova',
      phone: '+91 98765 43210',
      addressLine1: '42 Rue du Faubourg Saint-Honoré',
      addressLine2: 'Appartement 4B',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75008',
      isDefault: true,
    },
  })
  console.log(`[AUREVA Seeder] Patron verified: ${patron.email}`)

  // Admin User: Environment-driven development seed mechanism
  const adminEmail = process.env.ADMIN_EMAIL || (process.env.NODE_ENV !== 'production' ? 'curator@aureva-studios.demo' : null)
  const rawAdminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'AurevaAdmin2026!' : null)

  if (adminEmail && rawAdminPassword) {
    const adminHashed = await bcrypt.hash(rawAdminPassword, 10)
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: 'Henri de Montmirail',
        role: 'ADMIN',
        password: adminHashed,
      },
      create: {
        email: adminEmail,
        password: adminHashed,
        name: 'Henri de Montmirail',
        role: 'ADMIN',
      },
    })
    console.log(`[AUREVA Seeder] Curator Admin verified: ${adminUser.email}`)
  } else {
    console.log('[AUREVA Seeder] Skipping admin seed in production (ADMIN_EMAIL and ADMIN_PASSWORD must be provided via environment variables).')
  }

  // -------------------------------------------------------------------------
  // 3. Seed Realistic AUREVA Products, Variants & Images (Transactional)
  // -------------------------------------------------------------------------
  console.log(`[AUREVA Seeder] Seeding ${PRODUCTS.length} fashion silhouettes with variants...`)

  let productCount = 0
  let variantCount = 0
  let imageCount = 0

  for (const item of PRODUCTS) {
    const productSlug = slugify(item.name)

    // Match category
    let targetCat = categoryMap.get(item.category.toLowerCase())
    if (!targetCat) {
      if (item.category.toLowerCase().includes('coat') || item.category.toLowerCase().includes('outerwear')) {
        targetCat = categoryMap.get('coats')
      } else if (item.category.toLowerCase().includes('dress')) {
        targetCat = categoryMap.get('dresses')
      } else if (item.category.toLowerCase().includes('knit')) {
        targetCat = categoryMap.get('knitwear')
      } else if (item.category.toLowerCase().includes('trouser')) {
        targetCat = categoryMap.get('trousers')
      } else if (item.category.toLowerCase().includes('leather') || item.department === 'Accessories') {
        targetCat = categoryMap.get('leather-goods')
      } else {
        targetCat = categoryMap.get('tailoring')
      }
    }

    const basePrice = new Prisma.Decimal(item.price)
    const comparisonPrice = item.originalPrice ? new Prisma.Decimal(item.originalPrice) : null

    // Upsert Product record
    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        name: item.name,
        subtitle: item.subtitle || null,
        description: item.description,
        categoryId: targetCat.id,
        basePrice,
        comparisonPrice,
        isActive: item.inStock !== false,
        isFeatured: Boolean(item.isFeatured),
        isNew: Boolean(item.isNew),
        tag: item.tag || null,
        materials: item.materials || null,
        careInstructions: item.careInstructions || null,
        details: item.details || [],
      },
      create: {
        name: item.name,
        slug: productSlug,
        subtitle: item.subtitle || null,
        description: item.description,
        categoryId: targetCat.id,
        basePrice,
        comparisonPrice,
        isActive: item.inStock !== false,
        isFeatured: Boolean(item.isFeatured),
        isNew: Boolean(item.isNew),
        tag: item.tag || null,
        materials: item.materials || null,
        careInstructions: item.careInstructions || null,
        details: item.details || [],
      },
    })
    productCount++

    // Seed ProductImages
    await prisma.productImage.deleteMany({ where: { productId: product.id } })
    if (item.images && item.images.length > 0) {
      for (let orderIndex = 0; orderIndex < item.images.length; orderIndex++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: item.images[orderIndex],
            altText: `${item.name} - Angle ${orderIndex + 1}`,
            displayOrder: orderIndex,
          },
        })
        imageCount++
      }
    }

    // Seed ProductVariants (Matrix of Size x Color)
    const sizes = item.sizes && item.sizes.length > 0 ? item.sizes : ['One Size']
    const colors = item.colors && item.colors.length > 0 ? item.colors.map((c) => c.name) : ['Standard']

    for (const size of sizes) {
      for (const color of colors) {
        const skuPrefix = (item.id || product.id.slice(0, 6)).toUpperCase().replace(/[^A-Z0-9]/g, '')
        const sizeCode = size.replace(/\s+/g, '').toUpperCase()
        const colorCode = color.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '')
        const sku = `AUR-${skuPrefix}-${sizeCode}-${colorCode}`

        const stockQuantity = Math.floor(Math.random() * 8) + 4 // 4 to 11 units

        await prisma.productVariant.upsert({
          where: {
            productId_size_color: {
              productId: product.id,
              size,
              color,
            },
          },
          update: {
            sku,
            stockQuantity,
            image: item.images?.[0] || null,
          },
          create: {
            productId: product.id,
            size,
            color,
            sku,
            stockQuantity,
            image: item.images?.[0] || null,
          },
        })
        variantCount++
      }
    }
  }

  console.log(`[AUREVA Seeder] Seeded ${productCount} products, ${variantCount} product variants, and ${imageCount} gallery images.`)

  // -------------------------------------------------------------------------
  // 4. Seed Promotional Coupons
  // -------------------------------------------------------------------------
  console.log('[AUREVA Seeder] Seeding atelier privilege coupons...')
  const COUPONS = [
    {
      code: 'AUREVA15',
      discountType: 'PERCENTAGE',
      discountValue: new Prisma.Decimal(15),
      minOrderValue: new Prisma.Decimal(1000),
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'ATELIER10',
      discountType: 'PERCENTAGE',
      discountValue: new Prisma.Decimal(10),
      minOrderValue: null,
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: 'VIP20',
      discountType: 'PERCENTAGE',
      discountValue: new Prisma.Decimal(20),
      minOrderValue: new Prisma.Decimal(4000),
      usageLimit: 200,
      isActive: true,
    },
    {
      code: 'PRIVILEGE500',
      discountType: 'FIXED_AMOUNT',
      discountValue: new Prisma.Decimal(500),
      minOrderValue: new Prisma.Decimal(3000),
      usageLimit: 300,
      isActive: true,
    },
  ]

  for (const c of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
        usageLimit: c.usageLimit,
        isActive: c.isActive,
      },
      create: {
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
        usageLimit: c.usageLimit,
        isActive: c.isActive,
      },
    })
  }
  console.log(`[AUREVA Seeder] Seeded ${COUPONS.length} active coupons.`)

  console.log('✨ [AUREVA Seeder] Complete database seed successfully executed!')
}

main()
  .catch((e) => {
    console.error('❌ [AUREVA Seeder Fatal Error]:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
