import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit'

/**
 * Generate a short unique request ID for tracing
 */
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export async function middleware(request: NextRequest) {
  // 0. Generate Request ID for tracing/debugging
  const requestId = generateRequestId()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)
  // 1. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Build unique identifier: prefer IP, fallback to user-agent hash
    // Never use static fallback like '127.0.0.1' which would bypass rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const realIp = request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // @ts-ignore - request.ip exists in some environments
    const identifier = request.ip
      || forwardedFor
      || realIp
      || `ua-${userAgent.slice(0, 100).replace(/\s+/g, '-')}`

    const limitConfig = request.nextUrl.pathname.startsWith('/api/auth/')
      ? RATE_LIMITS.STRICT
      : RATE_LIMITS.DEFAULT

    const { success, limit, remaining, reset } = await rateLimit(identifier, limitConfig)

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later.',
          requestId
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': requestId,
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
          }
        }
      )
    }
  }

  // Pass request ID to downstream handlers via modified request
  const response = await updateSession(request)

  // Add request ID to response headers for client-side debugging
  response.headers.set('X-Request-Id', requestId)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
