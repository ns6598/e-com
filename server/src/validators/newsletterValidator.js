import { z } from 'zod'

export const subscribeNewsletterSchema = z.object({
  email: z.string().trim().email('Valid email address is required for Atelier Dispatch'),
})
