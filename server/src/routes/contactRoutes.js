import { Router } from 'express'
import { submitContact } from '../controllers/contactController.js'
import { validate } from '../middleware/validate.js'
import { contactInquirySchema } from '../validators/contactValidator.js'

const router = Router()

router.post('/', validate(contactInquirySchema), submitContact)

export default router
