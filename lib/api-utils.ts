import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin, isSuperAdmin, getUserRole, type UserRole } from '@/lib/auth-utils'
import { adminLogger, apiLogger } from '@/lib/logger'

/**
 * Error codes for standardized error handling
 */
export const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    RATE_LIMITED: 'RATE_LIMITED',
    CSRF_INVALID: 'CSRF_INVALID',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(
        public code: ErrorCode,
        message: string,
        public status: number = 400,
        public details?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
    }

    static validation(message: string, details?: unknown) {
        return new ApiError(ErrorCodes.VALIDATION_ERROR, message, 400, details)
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(ErrorCodes.UNAUTHORIZED, message, 401)
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(ErrorCodes.FORBIDDEN, message, 403)
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(ErrorCodes.NOT_FOUND, message, 404)
    }

    static internal(message = 'Internal server error') {
        return new ApiError(ErrorCodes.INTERNAL_ERROR, message, 500)
    }
}

/**
 * Standard API Response structure
 */
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    code?: ErrorCode
    message?: string
    meta?: {
        timestamp?: string
        requestId?: string
        duration?: number
    }
}

/**
 * Common API responses
 */
export const apiResponse = {
    success: <T>(data: T, message?: string, status = 200) => {
        return NextResponse.json(
            { success: true, data, message },
            { status }
        )
    },

    error: (error: string, status = 400, code?: ErrorCode) => {
        return NextResponse.json(
            { success: false, error, code: code || ErrorCodes.INTERNAL_ERROR },
            { status }
        )
    },

    validationError: (error: string, details?: unknown) => {
        return NextResponse.json(
            {
                success: false,
                error,
                code: ErrorCodes.VALIDATION_ERROR,
                details: process.env.NODE_ENV === 'development' ? details : undefined
            },
            { status: 400 }
        )
    },

    unauthorized: (message = 'Unauthorized') => {
        return NextResponse.json(
            { success: false, error: message, code: ErrorCodes.UNAUTHORIZED },
            { status: 401 }
        )
    },

    forbidden: (message = 'Forbidden') => {
        return NextResponse.json(
            { success: false, error: message, code: ErrorCodes.FORBIDDEN },
            { status: 403 }
        )
    },

    notFound: (message = 'Resource not found') => {
        return NextResponse.json(
            { success: false, error: message, code: ErrorCodes.NOT_FOUND },
            { status: 404 }
        )
    },

    serverError: (error: any, message = 'Internal server error') => {
        apiLogger.error({ err: error }, message)
        return NextResponse.json(
            {
                success: false,
                error: message,
                code: ErrorCodes.INTERNAL_ERROR,
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}

/**
 * Validate request body against a Zod schema
 * Returns { data, error } where error is a NextResponse if validation failed
 */
export async function validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
    try {
        const body = await request.json()
        const result = schema.safeParse(body)

        if (!result.success) {
            return {
                data: null,
                error: apiResponse.validationError(
                    result.error.issues.map(i => i.message).join(', '),
                    result.error.issues
                )
            }
        }

        return { data: result.data, error: null }
    } catch {
        return {
            data: null,
            error: apiResponse.validationError('Invalid JSON body')
        }
    }
}

/**
 * Validate URL search params against a Zod schema
 */
export function validateSearchParams<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const result = schema.safeParse(params)

    if (!result.success) {
        return {
            success: false,
            response: apiResponse.validationError(
                result.error.issues.map(i => i.message).join(', '),
                result.error.issues
            )
        }
    }

    return { success: true, data: result.data }
}

/**
 * Validate route params against a Zod schema
 */
export function validateParams<T>(
    params: Record<string, string | string[]>,
    schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
    const result = schema.safeParse(params)

    if (!result.success) {
        return {
            success: false,
            response: apiResponse.validationError(
                result.error.issues.map(i => i.message).join(', '),
                result.error.issues
            )
        }
    }

    return { success: true, data: result.data }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse {
    if (error instanceof ApiError) {
        return apiResponse.error(error.message, error.status, error.code)
    }

    if (error instanceof ZodError) {
        return apiResponse.validationError(
            error.issues.map(i => i.message).join(', '),
            error.issues
        )
    }

    if (error instanceof Error) {
        return apiResponse.serverError(error)
    }

    return apiResponse.serverError(new Error('Unknown error'))
}

/**
 * Shorthand helper functions for common responses
 */
export function successResponse<T>(data: T, status = 200) {
    return apiResponse.success(data, undefined, status)
}

export function errorResponse(message: string, status = 400, code?: ErrorCode) {
    return apiResponse.error(message, status, code)
}

/**
 * Validate query params with friendly return type
 * Returns { data, error } where error is a NextResponse if validation failed
 */
export async function validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
    const result = validateSearchParams(request, schema)
    if (result.success) {
        return { data: result.data, error: null }
    }
    return { data: null, error: result.response }
}

// ============================================================================
// Admin Route Wrappers
// ============================================================================

/**
 * Admin context passed to route handlers
 */
export interface AdminContext {
  user: {
    id: string
    email: string
    role: UserRole
  }
  supabase: Awaited<ReturnType<typeof createClient>>
  request: NextRequest
}

/**
 * Options for admin route wrapper
 */
export interface AdminRouteOptions {
  requireSuperAdmin?: boolean
}

/**
 * Admin route handler type
 */
export type AdminRouteHandler = (
  request: NextRequest,
  context: AdminContext
) => Promise<NextResponse>

/**
 * Higher-order function to wrap admin API routes with auth checks
 *
 * @example
 * export const GET = withAdmin(async (request, { user, supabase }) => {
 *   // user is guaranteed to be admin
 *   return successResponse({ data: 'admin only' })
 * })
 *
 * @example
 * // Require super admin
 * export const DELETE = withAdmin(
 *   async (request, { user }) => {
 *     return successResponse({ deleted: true })
 *   },
 *   { requireSuperAdmin: true }
 * )
 */
export function withAdmin(
  handler: AdminRouteHandler,
  options: AdminRouteOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return errorResponse('Unauthorized: Authentication required', 401, ErrorCodes.UNAUTHORIZED)
      }

      // Check admin status
      const isAdmin = await isCurrentUserAdmin()
      if (!isAdmin) {
        return errorResponse('Forbidden: Admin access required', 403, ErrorCodes.FORBIDDEN)
      }

      // Check super admin if required
      if (options.requireSuperAdmin) {
        const isSuperAdminUser = await isSuperAdmin(user.id)
        if (!isSuperAdminUser) {
          return errorResponse('Forbidden: Super admin access required', 403, ErrorCodes.FORBIDDEN)
        }
      }

      // Get user role for context
      const role = await getUserRole(user.id)

      // Create context
      const context: AdminContext = {
        user: {
          id: user.id,
          email: user.email || '',
          role
        },
        supabase,
        request
      }

      // Call the actual handler
      return await handler(request, context)

    } catch (error: any) {
      adminLogger.error({ err: error }, 'Admin route error')
      return errorResponse(
        error.message || 'Internal server error',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }
  }
}

/**
 * Moderator route wrapper (moderator+ access)
 */
export function withModerator(
  handler: AdminRouteHandler
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return errorResponse('Unauthorized', 401, ErrorCodes.UNAUTHORIZED)
      }

      const role = await getUserRole(user.id)
      const hasAccess = ['moderator', 'admin', 'super_admin'].includes(role)

      if (!hasAccess) {
        return errorResponse('Forbidden: Moderator access required', 403, ErrorCodes.FORBIDDEN)
      }

      const context: AdminContext = {
        user: { id: user.id, email: user.email || '', role },
        supabase,
        request
      }

      return await handler(request, context)

    } catch (error: any) {
      adminLogger.error({ err: error }, 'Moderator route error')
      return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
    }
  }
}

/**
 * Authenticated user route wrapper (any logged-in user)
 */
export function withAuth(
  handler: AdminRouteHandler
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return errorResponse('Unauthorized', 401, ErrorCodes.UNAUTHORIZED)
      }

      const role = await getUserRole(user.id)

      const context: AdminContext = {
        user: { id: user.id, email: user.email || '', role },
        supabase,
        request
      }

      return await handler(request, context)

    } catch (error: any) {
      apiLogger.error({ err: error }, 'Auth route error')
      return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
    }
  }
}
