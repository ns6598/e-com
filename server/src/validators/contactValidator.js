import { z } from 'zod'

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Valid email address is required'),
  subject: z.string().trim().min(2, 'Subject is required').optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters in length'),
})
