import { prisma, dbStatus } from '../../config/db.js'
import MockPaymentProvider from './MockPaymentProvider.js'
import StripePaymentProvider from './StripePaymentProvider.js'
import RazorpayPaymentProvider from './RazorpayPaymentProvider.js'

// Cache of processed webhook event IDs to guarantee idempotent webhook processing
const processedWebhookEvents = new Set()

// Cleanup processed webhook cache older than 24 hours
setInterval(() => {
  if (processedWebhookEvents.size > 10000) {
    processedWebhookEvents.clear()
  }
}, 60 * 60 * 1000).unref()

class PaymentService {
  constructor() {
    this.providers = new Map()
    this.providers.set('unconfigured_mock', new MockPaymentProvider())
    this.providers.set('mock', new MockPaymentProvider())
    this.providers.set('stripe', new StripePaymentProvider())
    this.providers.set('razorpay', new RazorpayPaymentProvider())
  }

  /**
   * Resolve active payment provider based on environment configuration
   */
  getProvider(preferredName) {
    const providerKey = (preferredName || process.env.PAYMENT_PROVIDER || 'unconfigured_mock').toLowerCase().trim()
    const provider = this.providers.get(providerKey)
    if (provider) return provider
    return this.providers.get('unconfigured_mock')
  }

  /**
   * Get public payment configuration status (never leaks secret credentials)
   */
  getConfig() {
    const activeProvider = this.getProvider()
    return {
      provider: activeProvider.name,
      isConfigured: activeProvider.isConfigured,
      isLive: activeProvider.isConfigured,
      mode: activeProvider.isConfigured ? 'live' : 'simulation',
      currency: 'INR',
      supportedMethods: activeProvider.isConfigured
        ? ['card', 'upi', 'netbanking']
        : ['atelier_cod', 'simulation'],
      notice: activeProvider.isConfigured
        ? `Official ${activeProvider.name.toUpperCase()} gateway integration active.`
        : 'No external payment provider configured. Operating in White-Glove Atelier / Test Simulation mode.',
    }
  }

  /**
   * Initiate payment session for an existing order
   */
  async createPaymentSession(orderId, user) {
    if (!orderId) {
      throw new Error('Order identifier is required to initiate payment session.')
    }

    // 1. Authoritative Order Lookup with Ownership Verification
    let order = null
    if (dbStatus.isConnected && prisma) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderReference: orderId }],
        },
        include: { items: true, user: true },
      })
    }

    if (!order) {
      // In-memory fallback lookup
      const { mockOrders } = await import('../../controllers/orderController.js').catch(() => ({ mockOrders: new Map() }))
      order = mockOrders?.get(orderId) || Array.from(mockOrders?.values() || []).find((o) => o.id === orderId || o.orderReference === orderId)
    }

    if (!order) {
      const error = new Error(`Order reference '${orderId}' not found.`)
      error.statusCode = 404
      error.code = 'ORDER_NOT_FOUND'
      throw error
    }

    // IDOR Protection: Verify customer ownership
    if (user && order.userId && order.userId !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Access denied to this order payment session.')
      error.statusCode = 403
      error.code = 'FORBIDDEN'
      throw error
    }

    if (order.paymentStatus === 'PAID') {
      const error = new Error('This order acquisition has already been paid and finalized.')
      error.statusCode = 400
      error.code = 'ORDER_ALREADY_PAID'
      throw error
    }

    const provider = this.getProvider()
    return provider.createPaymentSession({ order, customer: user || order.user })
  }

  /**
   * Authoritatively verify payment and update paymentStatus
   */
  async verifyPayment(orderId, paymentData, user) {
    let order = null
    if (dbStatus.isConnected && prisma) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderReference: orderId }],
        },
        include: { items: true, user: true },
      })
    }

    if (!order) {
      const { mockOrders } = await import('../../controllers/orderController.js').catch(() => ({ mockOrders: new Map() }))
      order = mockOrders?.get(orderId) || Array.from(mockOrders?.values() || []).find((o) => o.id === orderId || o.orderReference === orderId)
    }

    if (!order) {
      const error = new Error(`Order '${orderId}' not found for verification.`)
      error.statusCode = 404
      error.code = 'ORDER_NOT_FOUND'
      throw error
    }

    if (user && order.userId && order.userId !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Access denied to verify payment for this order.')
      error.statusCode = 403
      error.code = 'FORBIDDEN'
      throw error
    }

    const provider = this.getProvider(paymentData?.provider)
    const verification = await provider.verifyPayment({ order, paymentData })

    if (verification.verified && verification.status === 'PAID') {
      // Authoritatively update paymentStatus to PAID
      if (dbStatus.isConnected && prisma) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: order.orderStatus === 'PENDING' ? 'PROCESSING' : order.orderStatus,
          },
        })
      } else {
        order.paymentStatus = 'PAID'
        if (order.orderStatus === 'PENDING') {
          order.orderStatus = 'PROCESSING'
          order.status = 'PROCESSING'
        }
      }
    }

    return {
      orderId: order.id,
      orderReference: order.orderReference,
      paymentStatus: verification.status || (verification.verified ? 'PAID' : 'FAILED'),
      orderStatus: order.orderStatus,
      transactionId: verification.transactionId,
      amount: verification.amount,
      currency: verification.currency,
      verified: verification.verified,
    }
  }

  /**
   * Process incoming webhook event with signature check, idempotency, and amount validation
   */
  async handleWebhook(providerName, rawBody, signature, headers) {
    const provider = this.getProvider(providerName)
    const event = await provider.handleWebhook({ rawBody, signature, headers })

    // 1. Idempotency Check: Prevent duplicate webhook processing
    if (event.eventId && processedWebhookEvents.has(event.eventId)) {
      return {
        idempotent: true,
        alreadyProcessed: true,
        eventId: event.eventId,
        message: 'Webhook event already processed previously.',
      }
    }

    // 2. Authoritative Order Lookup
    const orderRef = event.orderReference || event.orderId
    if (orderRef) {
      let order = null
      if (dbStatus.isConnected && prisma) {
        order = await prisma.order.findFirst({
          where: {
            OR: [{ id: orderRef }, { orderReference: orderRef }],
          },
        })
      }

      if (!order) {
        const { mockOrders } = await import('../../controllers/orderController.js').catch(() => ({ mockOrders: new Map() }))
        order = mockOrders?.get(orderRef) || Array.from(mockOrders?.values() || []).find((o) => o.id === orderRef || o.orderReference === orderRef)
      }

      if (order) {
        // 3. Amount & Currency Validation
        if (event.amount && Number(order.total) > 0) {
          const expectedAmount = Number(order.total)
          const receivedAmount = Number(event.amount)
          // Verify with 1-rupee precision to account for minor rounding
          if (Math.abs(expectedAmount - receivedAmount) > 1) {
            console.warn(`[Payment Webhook Security] Amount mismatch on order ${orderRef}: Expected ${expectedAmount}, received ${receivedAmount}`)
            throw new Error(`Payment amount mismatch for order ${orderRef}.`)
          }
        }

        // 4. Update Decoupled Payment Status
        if (event.status) {
          if (dbStatus.isConnected && prisma) {
            await prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: event.status },
            })
          } else {
            order.paymentStatus = event.status
          }
        }
      }
    }

    // Record processed event ID
    if (event.eventId) {
      processedWebhookEvents.add(event.eventId)
    }

    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      orderReference: orderRef,
      paymentStatus: event.status,
    }
  }
}

export const paymentService = new PaymentService()
export default paymentService
