/**
 * Base Abstract Payment Provider Contract
 *
 * Defines the standard lifecycle interface that any payment provider (Stripe, Razorpay, Mock)
 * must implement to integrate with AUREVA's commerce engine.
 */
export class PaymentProvider {
  constructor(name) {
    if (new.target === PaymentProvider) {
      throw new TypeError('Cannot construct PaymentProvider instances directly. Subclass must be implemented.')
    }
    this.name = name
    this.isConfigured = false
  }

  /**
   * Create a checkout session or payment intent
   * @param {Object} params
   * @param {Object} params.order - Authoritative database order record
   * @param {Object} params.customer - Authenticated patron profile
   * @returns {Promise<{ sessionId: string, clientSecret?: string, checkoutUrl?: string, provider: string }>}
   */
  async createPaymentSession(params) {
    throw new Error(`createPaymentSession() not implemented in ${this.name}`)
  }

  /**
   * Authoritatively verify payment confirmation
   * @param {Object} params
   * @param {Object} params.order - Authoritative order
   * @param {Object} params.paymentData - Client submission or verification payload
   * @returns {Promise<{ verified: boolean, transactionId: string, amount: number, currency: string, raw?: any }>}
   */
  async verifyPayment(params) {
    throw new Error(`verifyPayment() not implemented in ${this.name}`)
  }

  /**
   * Cryptographically verify and parse provider webhook events
   * @param {Object} params
   * @param {Buffer|string} params.rawBody - Raw unparsed HTTP request body
   * @param {string} params.signature - Provider signature header
   * @param {Object} params.headers - HTTP request headers
   * @returns {Promise<{ eventId: string, eventType: string, orderReference: string, transactionId: string, amount: number, currency: string, status: 'PAID'|'FAILED'|'REFUNDED', rawEvent?: any }>}
   */
  async handleWebhook(params) {
    throw new Error(`handleWebhook() not implemented in ${this.name}`)
  }

  /**
   * Process refund through provider
   * @param {Object} params
   * @param {Object} params.order
   * @param {number} params.amount
   * @param {string} params.reason
   * @returns {Promise<{ success: boolean, refundId: string }>}
   */
  async refundPayment(params) {
    throw new Error(`refundPayment() not implemented in ${this.name}`)
  }
}

export default PaymentProvider
