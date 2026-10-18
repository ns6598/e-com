import paymentService from '../services/payment/paymentService.js'
import { successResponse, errorResponse } from '../utils/response.js'

/**
 * Get active payment configuration
 * Endpoint: GET /api/payments/config
 */
export async function getPaymentConfig(req, res, next) {
  try {
    const config = paymentService.getConfig()
    return successResponse(res, {
      message: 'Atelier payment configuration status',
      data: config,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create checkout payment session
 * Endpoint: POST /api/payments/create-session
 */
export async function createPaymentSession(req, res, next) {
  try {
    const { orderId } = req.body
    if (!orderId) {
      return errorResponse(res, {
        message: 'Order identifier is required to create a payment session.',
        code: 'MISSING_ORDER_ID',
        statusCode: 400,
      })
    }

    const session = await paymentService.createPaymentSession(orderId, req.user)
    return successResponse(res, {
      message: 'Payment session initialized',
      data: session,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Authoritatively verify payment confirmation
 * Endpoint: POST /api/payments/verify
 */
export async function verifyPayment(req, res, next) {
  try {
    const { orderId } = req.body
    const paymentData = req.body.paymentData || req.body
    if (!orderId) {
      return errorResponse(res, {
        message: 'Order identifier is required for payment verification.',
        code: 'MISSING_ORDER_ID',
        statusCode: 400,
      })
    }

    const result = await paymentService.verifyPayment(orderId, paymentData, req.user)
    if (!result.verified || result.paymentStatus === 'FAILED') {
      return errorResponse(res, {
        message: 'Payment verification failed: invalid signature or transaction rejected.',
        code: 'INVALID_PAYMENT_SIGNATURE',
        statusCode: 400,
      })
    }

    return successResponse(res, {
      message: 'Payment verification processed',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Handle incoming provider webhooks with rawBody signature verification
 * Endpoint: POST /api/payments/webhook/:provider
 */
export async function handlePaymentWebhook(req, res, next) {
  try {
    const { provider } = req.params
    const rawBody = req.rawBody || req.body
    const signature =
      req.headers['stripe-signature'] ||
      req.headers['x-razorpay-signature'] ||
      req.headers['x-webhook-signature'] ||
      req.headers['x-signature']

    const result = await paymentService.handleWebhook(provider, rawBody, signature, req.headers)
    const message = result.alreadyProcessed
      ? 'Webhook event already processed previously.'
      : 'Webhook processed successfully'

    return successResponse(res, {
      message,
      data: result,
    })
  } catch (error) {
    console.error(`[Webhook Error: ${req.params?.provider}]`, error.message)
    return errorResponse(res, {
      message: error.message || 'Webhook verification failed',
      code: 'WEBHOOK_VERIFICATION_FAILED',
      statusCode: 400,
    })
  }
}
