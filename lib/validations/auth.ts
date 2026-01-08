import { z } from 'zod'
import { emailSchema, shortTextSchema, urlSchema } from './common'

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
})

// Profile update schema
export const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional().nullable(),
  full_name: z.string().min(1).max(100).optional().nullable(),
  avatar_url: urlSchema.optional().nullable(),
})

// MFA enroll schema
export const mfaEnrollSchema = z.object({
  factorType: z.enum(['totp']),
  friendlyName: z.string().max(50).optional(),
})

// MFA verify schema
export const mfaVerifySchema = z.object({
  factorId: z.string().min(1),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
})

// MFA challenge schema
export const mfaChallengeSchema = z.object({
  factorId: z.string().min(1),
})

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

// Password reset schema
export const passwordResetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
})

// GDPR data export schema
export const gdprExportSchema = z.object({
  format: z.enum(['json', 'zip']).default('json'),
})

// GDPR delete account schema
export const gdprDeleteAccountSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT'),
  password: z.string().optional(), // For password-based accounts
})

// Type exports
export type Login = z.infer<typeof loginSchema>
export type UpdateProfile = z.infer<typeof updateProfileSchema>
export type MfaEnroll = z.infer<typeof mfaEnrollSchema>
export type MfaVerify = z.infer<typeof mfaVerifySchema>
export type PasswordReset = z.infer<typeof passwordResetSchema>
export type GdprExport = z.infer<typeof gdprExportSchema>
