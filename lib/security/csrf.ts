import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
    return nanoid(CSRF_TOKEN_LENGTH)
}

/**
 * Set CSRF token in cookies (call this on auth/session start)
 */
export async function setCsrfToken(): Promise<string> {
    const token = generateCsrfToken()
    const cookieStore = await cookies()

    cookieStore.set(CSRF_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    })

    return token
}

/**
 * Get CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string | undefined> {
    const cookieStore = await cookies()
    return cookieStore.get(CSRF_TOKEN_COOKIE)?.value
}

/**
 * Validate CSRF token from request header against cookie
 * Uses constant-time comparison to prevent timing attacks
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
    const headerToken = request.headers.get(CSRF_TOKEN_HEADER)
    const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value

    if (!headerToken || !cookieToken) {
        return false
    }

    // Constant-time comparison
    return constantTimeCompare(headerToken, cookieToken)
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
}

/**
 * CSRF validation middleware helper
 * Returns error response if validation fails, null if valid
 */
export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
    // Skip CSRF for safe methods
    const method = request.method.toUpperCase()
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return null
    }

    // Skip CSRF for public API endpoints that don't require auth
    const publicPaths = [
        '/api/theme/active',
        '/api/analytics/track',
    ]

    const pathname = request.nextUrl.pathname
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return null
    }

    const isValid = await validateCsrfToken(request)

    if (!isValid) {
        return NextResponse.json(
            {
                success: false,
                error: 'Invalid or missing CSRF token',
                code: 'CSRF_INVALID'
            },
            { status: 403 }
        )
    }

    return null
}

/**
 * API route to get a new CSRF token (for client-side fetch)
 * Client should call this on page load and include token in subsequent requests
 */
export async function refreshCsrfToken(): Promise<{ token: string }> {
    const token = await setCsrfToken()
    return { token }
}
