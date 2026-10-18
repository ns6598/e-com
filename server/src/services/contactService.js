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

  async listInquiries() {
    if (dbStatus.isConnected && prisma) {
      try {
        const records = await prisma.contactMessage.findMany({
          orderBy: { createdAt: 'desc' },
        })
        return records.map((r) => ({
          referenceId: r.id,
          id: r.id,
          name: r.name,
          email: r.email,
          subject: r.subject,
          message: r.message,
          status: 'RECEIVED',
          createdAt: r.createdAt,
        }))
      } catch (err) {
        console.warn('[Contact Service] List fallback:', err.message)
      }
    }

    return Array.from(mockInquiries.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  },

  async updateInquiryStatus(id, status) {
    const item = mockInquiries.get(id)
    if (item) {
      item.status = status
      mockInquiries.set(id, item)
      return item
    }
    return { id, status }
  },
}

export default contactService
