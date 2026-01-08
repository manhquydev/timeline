import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'

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
        console.error('API Error:', error)
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
 */
export async function validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
    try {
        const body = await request.json()
        const result = schema.safeParse(body)

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
    } catch {
        return {
            success: false,
            response: apiResponse.validationError('Invalid JSON body')
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
