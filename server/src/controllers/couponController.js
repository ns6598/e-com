import couponService from '../services/couponService.js'
import { successResponse, errorResponse } from '../utils/response.js'

export async function validateCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body
    const result = await couponService.validate(code, subtotal)

    if (!result.valid) {
      return errorResponse(res, {
        message: result.message,
        code: 'INVALID_COUPON',
        statusCode: 400,
      })
    }

    return successResponse(res, {
      message: result.message,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
