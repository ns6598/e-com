import contactService from '../services/contactService.js'
import { successResponse } from '../utils/response.js'

export function submitContact(req, res) {
  const result = contactService.createInquiry(req.body)

  return successResponse(res, {
    message: result.message,
    data: result.inquiry,
    statusCode: 201,
  })
}
