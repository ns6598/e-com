import { prisma, dbStatus } from '../config/db.js'

const mockSubscribers = new Set()

export const newsletterService = {
  async subscribe(email) {
    const cleanEmail = email.trim().toLowerCase()

    if (dbStatus.isConnected && prisma) {
      try {
        const existing = await prisma.newsletterSubscriber.findUnique({
          where: { email: cleanEmail },
        })

        if (existing) {
          return {
            isNew: false,
            message: 'This email is already enrolled in the Private Atelier Dispatch.',
          }
        }

        await prisma.newsletterSubscriber.create({
          data: { email: cleanEmail },
        })

        return {
          isNew: true,
          message: 'Welcome to the Atelier Dispatch. Private monograph allocations will be delivered to your inbox.',
        }
      } catch (err) {
        console.warn('[NewsletterService] Database fallback:', err.message)
      }
    }

    if (mockSubscribers.has(cleanEmail)) {
      return {
        isNew: false,
        message: 'This email is already enrolled in the Private Atelier Dispatch.',
      }
    }

    mockSubscribers.add(cleanEmail)
    return {
      isNew: true,
      message: 'Welcome to the Atelier Dispatch. Private monograph allocations will be delivered to your inbox.',
    }
  },
}

export default newsletterService
