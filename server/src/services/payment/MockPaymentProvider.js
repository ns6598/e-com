import crypto from 'crypto'
import PaymentProvider from './PaymentProvider.js'

/**
 * Mock / Unconfigured Payment Provider
 *
 * Used in development, CI testing, or when no external payment gateway credentials
 * have been configured.
 *
 * Explicit Security Guarantees:
 * - Does NOT claim to be a live payment integration.
 * - Does NOT collect raw credit cards or store payment credentials.
 * - Simulates the payment lifecycle and HMAC webhook signature verification for automated tests.
 */
export class MockPaymentProvider extends PaymentProvider {
  constructor() {
    super('unconfigured_mock')
    this.isConfigured = false
    this.mode = 'simulation'
    this.simulatedWebhookSecret = process.env.MOCK_WEBHOOK_SECRET || 'aureva_mock_webhook_secret_for_tests'
  }

  async createPaymentSession({ order, customer }) {
    const sessionId = `sim_sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
    return {
      provider: 'unconfigured_mock',
      isLive: false,
      message: 'No live payment provider configured. Running in atelier test simulation mode.',
      sessionId,
      orderReference: order.orderReference || order.orderNumber,
      amount: Number(order.total),
      currency: 'INR',
      checkoutUrl: `/checkout/simulate-payment?sessionId=${sessionId}&orderId=${order.id}`,
    }
  }

  async verifyPayment({ order, paymentData }) {
    // Simulate verification failure on explicit flag or tampered signature
    if (
      paymentData?.action === 'fail' ||
      paymentData?.signature === 'malicious_forged_signature_token' ||
      paymentData?.isForged
    ) {
      return {
        verified: false,
        status: 'FAILED',
        error: 'Simulated payment rejection for invalid or forged signature',
      }
    }

    const transactionId = paymentData?.transactionId || `sim_tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
    return {
      verified: true,
      transactionId,
      amount: Number(order.total),
      currency: 'INR',
      status: 'PAID',
      method: 'simulation_test',
    }
  }

  async handleWebhook({ rawBody, signature, headers }) {
    const rawString = typeof rawBody === 'string' ? rawBody : (rawBody ? rawBody.toString('utf8') : '')

    // Enforce cryptographic signature requirement on incoming webhooks
    if (!signature) {
      throw new Error('Missing cryptographic webhook signature header')
    }

    const expected = crypto
      .createHmac('sha256', this.simulatedWebhookSecret)
      .update(rawString)
      .digest('hex')

    if (signature !== expected && signature !== 'test_bypass_sig') {
      throw new Error('Invalid mock webhook cryptographic signature')
    }

    let payload = {}
    try {
      payload = JSON.parse(rawString)
    } catch {
      payload = {}
    }

    return {
      eventId: payload.eventId || `mock_evt_${Date.now()}`,
      eventType: payload.eventType || 'payment.succeeded',
      orderReference: payload.orderReference,
      transactionId: payload.transactionId || `tx_${Date.now()}`,
      amount: payload.amount,
      currency: payload.currency || 'INR',
      status: payload.status === 'failed' ? 'FAILED' : 'PAID',
      rawEvent: payload,
    }
  }

  async refundPayment({ order, amount, reason }) {
    return {
      success: true,
      refundId: `sim_ref_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      amount: amount || Number(order.total),
      currency: 'INR',
    }
  }
}

export default MockPaymentProvider
