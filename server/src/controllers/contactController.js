import contactService from '../services/contactService.js'
import { successResponse } from '../utils/response.js'

export async function submitContact(req, res, next) {
  try {
    const result = await contactService.createInquiry(req.body)

    return successResponse(res, {
      message: result.message,
      data: result.inquiry,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}
