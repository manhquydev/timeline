import { NextResponse } from 'next/server'
import { refreshCsrfToken } from '@/lib/security/csrf'

/**
 * GET /api/csrf
 * Get a fresh CSRF token for client-side requests
 */
export async function GET() {
    try {
        const { token } = await refreshCsrfToken()
        return NextResponse.json({ token })
    } catch (error) {
        console.error('Error generating CSRF token:', error)
        return NextResponse.json(
            { error: 'Failed to generate CSRF token' },
            { status: 500 }
        )
    }
}
