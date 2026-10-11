import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PRODUCTS } from '../src/data/products.js'

const prisma = new PrismaClient()

async function main() {
  console.log('[AUREVA Seeder] Initiating database seed...')

  // 1. Seed Demo Patron User
  const demoPassword = await bcrypt.hash('AurevaSalon2026!', 10)
  const patron = await prisma.user.upsert({
    where: { email: 'patron@aureva-studios.demo' },
    update: {},
    create: {
      email: 'patron@aureva-studios.demo',
      password: demoPassword,
      name: 'Elena Rostova',
      role: 'CUSTOMER',
    },
  })
  console.log(`[AUREVA Seeder] Demo patron verified: ${patron.email}`)

  // 2. Seed 20 Luxury Catalog Products
  let seededCount = 0
  for (const item of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        subtitle: item.subtitle,
        description: item.description,
        category: item.category,
        department: item.department,
        price: item.price,
        originalPrice: item.originalPrice,
        inStock: item.inStock,
        stock: item.stock || 10,
        isNew: item.isNew,
        isFeatured: item.isFeatured,
        tag: item.tag,
        images: item.images,
        sizes: item.sizes,
        colors: item.colors,
        materials: item.materials,
        careInstructions: item.careInstructions,
        details: item.details,
      },
      create: {
        id: item.id,
        name: item.name,
        subtitle: item.subtitle,
        description: item.description,
        category: item.category,
        department: item.department,
        price: item.price,
        originalPrice: item.originalPrice,
        inStock: item.inStock,
        stock: item.stock || 10,
        isNew: item.isNew,
        isFeatured: item.isFeatured,
        tag: item.tag,
        images: item.images,
        sizes: item.sizes,
        colors: item.colors,
        materials: item.materials,
        careInstructions: item.careInstructions,
        details: item.details,
      },
    })
    seededCount++
  }

  console.log(`[AUREVA Seeder] Successfully seeded ${seededCount} monograph products.`)
  console.log('[AUREVA Seeder] Database seed completed successfully.')
}

main()
  .catch((e) => {
    console.error('[AUREVA Seeder Error]', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
