/**
 * AUREVA Concierge Desk & Inquiries Service
 */

const mockInquiries = new Map()

export const contactService = {
  createInquiry({ name, email, subject, message }) {
    const referenceId = `INQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

    const inquiry = {
      referenceId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject || 'General Atelier Inquiry',
      message: message.trim(),
      status: 'RECEIVED',
      createdAt: new Date().toISOString(),
    }

    mockInquiries.set(referenceId, inquiry)

    return {
      referenceId,
      message: `Your dossier reference is ${referenceId}. Our atelier concierge will review and reply within 24 business hours.`,
      inquiry,
    }
  },
}

export default contactService
