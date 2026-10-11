import { Router } from 'express'
import { subscribeNewsletter } from '../controllers/newsletterController.js'
import { validate } from '../middleware/validate.js'
import { subscribeNewsletterSchema } from '../validators/newsletterValidator.js'

const router = Router()

router.post('/subscribe', validate(subscribeNewsletterSchema), subscribeNewsletter)

export default router
