import { prisma, dbStatus } from '../config/db.js'

/**
 * AUREVA Concierge Desk & Inquiries Service
 * Persists to PostgreSQL via Prisma ContactMessage model when connected,
 * with fallback storage for offline operation.
 */

const mockInquiries = new Map()

export const contactService = {
  async createInquiry({ name, email, subject, message }) {
    const referenceId = `INQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    const cleanName = (name || '').trim()
    const cleanEmail = (email || '').trim().toLowerCase()
    const cleanSubject = (subject || 'General Atelier Inquiry').trim()
    const cleanMessage = (message || '').trim()

    let persistedRecord = null

    if (dbStatus.isConnected && prisma) {
      try {
        persistedRecord = await prisma.contactMessage.create({
          data: {
            name: cleanName,
            email: cleanEmail,
            subject: cleanSubject,
            message: cleanMessage,
          },
        })
      } catch (err) {
        console.warn('[Contact Service] Database write fallback:', err.message)
      }
    }

    const inquiry = {
      referenceId: persistedRecord ? persistedRecord.id : referenceId,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      status: 'RECEIVED',
      createdAt: persistedRecord ? persistedRecord.createdAt.toISOString() : new Date().toISOString(),
    }

    mockInquiries.set(inquiry.referenceId, inquiry)

    return {
      referenceId: inquiry.referenceId,
      message: `Your dossier reference is ${inquiry.referenceId}. Our atelier concierge will review and reply within 24 business hours.`,
      inquiry,
    }
  },
}

export default contactService
