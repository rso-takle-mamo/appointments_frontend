import { z } from 'zod'

export const companyInfoSchema = z.object({
  vatNumber: z
    .string()
    .min(1, 'VAT number is required')
    .regex(/^[A-Z]{2}[0-9A-Z]{8,12}$/, 'Invalid VAT format. Please use country code followed by VAT number'),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  companyAddress: z
    .string()
    .min(1, 'Company address is required')
    .max(500, 'Company address must be less than 500 characters'),
  businessPhone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((phone) => {
      if (!phone || phone === '') return true 
      return /^[+]?[\d\s\-()]{7,20}$/.test(phone)
    }, 'Invalid phone number format'),
  businessEmail: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
})

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>