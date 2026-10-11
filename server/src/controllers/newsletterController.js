import newsletterService from '../services/newsletterService.js'
import { successResponse } from '../utils/response.js'

export async function subscribeNewsletter(req, res, next) {
  try {
    const { email } = req.body
    const result = await newsletterService.subscribe(email)

    return successResponse(res, {
      message: result.message,
      data: { email, isNew: result.isNew },
      statusCode: result.isNew ? 201 : 200,
    })
  } catch (err) {
    next(err)
  }
}
