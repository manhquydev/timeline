import { z, ZodError, ZodSchema } from 'zod'
import { NextRequest } from 'next/server'

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
 * Parse JSON body from request with schema validation
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json()
    return validateSchema(schema, body)
  } catch {
    return {
      success: false,
      error: 'Invalid JSON body',
      details: [],
    }
  }
}

/**
 * Parse URL search params with schema validation
 */
export function parseSearchParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): ValidationResult<T> {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  return validateSchema(schema, params)
}

/**
 * Parse FormData with schema validation
 */
export async function parseFormData<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const formData = await request.formData()
    const data: Record<string, unknown> = {}

    formData.forEach((value, key) => {
      // Handle multiple values with same key
      if (data[key]) {
        if (Array.isArray(data[key])) {
          (data[key] as unknown[]).push(value)
        } else {
          data[key] = [data[key], value]
        }
      } else {
        data[key] = value
      }
    })

    return validateSchema(schema, data)
  } catch {
    return {
      success: false,
      error: 'Invalid form data',
      details: [],
    }
  }
}

/**
 * Parse route params with schema validation
 */
export function parseParams<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): ValidationResult<T> {
  return validateSchema(schema, params)
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
