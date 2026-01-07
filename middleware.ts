import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit'

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // @ts-ignore - request.ip might exist or we use headers
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const limitConfig = request.nextUrl.pathname.startsWith('/api/auth/')
      ? RATE_LIMITS.STRICT
      : RATE_LIMITS.DEFAULT

    const { success, limit, remaining, reset } = rateLimit(ip, limitConfig)

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later.'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      )
    }
  }

  return await updateSession(request)
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
