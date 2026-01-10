import { z, ZodError, ZodSchema } from 'zod'

// Re-export all schemas
export * from './common'
export * from './posts'
export * from './events'
export * from './upload'
export * from './admin'
export * from './auth'

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details: z.ZodIssue[] }

/**
 * Validate data against a Zod schema
 */
export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map(i => i.message).join(', '),
        details: error.issues,
      }
    }
    return {
      success: false,
      error: 'Validation failed',
      details: [],
    }
  }
}

/**
 * Format validation errors for API response
 */
export function formatValidationError(result: ValidationResult<unknown>): {
  error: string
  code: string
  details?: z.ZodIssue[]
} {
  if (result.success) {
    throw new Error('Cannot format successful validation')
  }

  return {
    error: result.error,
    code: 'VALIDATION_ERROR',
    details: process.env.NODE_ENV === 'development' ? result.details : undefined,
  }
}
