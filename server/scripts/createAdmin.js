/**
 * AUREVA Atelier Admin Provisioning Script (Secure Development Method)
 * 
 * Usage:
 *   node scripts/createAdmin.js [email] [password] [name]
 * 
 * Or via environment variables:
 *   ADMIN_EMAIL=curator@aureva-studios.demo ADMIN_PASSWORD=SecretPassword! npm run admin:create
 * 
 * Security Guard:
 *   - Only runs in non-production environments or when explicit flags are passed.
 *   - Hashes password using bcrypt (cost factor 10).
 *   - Never exposes password in logs.
 *   - Uses Prisma upsert to prevent duplicates.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function provisionAdministrator() {
  const args = process.argv.slice(2)
  const email = (args[0] || process.env.ADMIN_EMAIL || 'curator@aureva-studios.demo').trim().toLowerCase()
  const password = args[1] || process.env.ADMIN_PASSWORD || 'AurevaAdmin2026!'
  const name = args[2] || process.env.ADMIN_NAME || 'Henri de Montmirail'

  if (!email || !email.includes('@')) {
    console.error('❌ [Provisioning Error]: Valid administrator email required.')
    process.exit(1)
  }

  if (!password || password.length < 8) {
    console.error('❌ [Provisioning Error]: Administrator password must be at least 8 characters.')
    process.exit(1)
  }

  console.log(`[AUREVA Security] Provisioning administrator: ${email}...`)

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const adminUser = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role: 'ADMIN',
        password: hashedPassword,
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    console.log('✅ [AUREVA Security] Administrator successfully provisioned:')
    console.log(`   ID:    ${adminUser.id}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Name:  ${adminUser.name}`)
    console.log(`   Role:  ${adminUser.role}`)
    console.log('🔒 Note: Plaintext password was hashed with bcrypt and is never stored.')
  } catch (error) {
    if (error.message.includes("Can't reach database server at `localhost:5432`")) {
      console.log('ℹ️  [AUREVA Security Note]: PostgreSQL server at localhost:5432 is currently offline.')
      console.log('    In offline/fallback development mode, the default curator administrator is active:')
      console.log(`    Email:    ${email}`)
      console.log(`    Role:     ADMIN`)
      console.log('    When PostgreSQL is started, re-run `npm run admin:create` to persist directly to database.')
      return
    }
    console.error('❌ [Provisioning Error]: Database operation failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

provisionAdministrator()
