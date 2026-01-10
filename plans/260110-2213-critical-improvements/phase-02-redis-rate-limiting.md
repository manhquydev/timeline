# Phase 02: Redis Rate Limiting (Upstash)

## Context Links
- Parent: [plan.md](./plan.md)
- Research: [researcher-02-redis-logging.md](./research/researcher-02-redis-logging.md)
- Scout: [scout-01-security-middleware.md](./scout/scout-01-security-middleware.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-10 |
| Priority | P0 - Critical |
| Effort | 2h |
| Implementation Status | pending |
| Review Status | pending |

Replace in-memory rate limiter with Upstash Redis for multi-instance compatibility.

## Key Insights

- Current rate limiter uses in-memory Map - fails in serverless/multi-instance
- Upstash provides REST API - no TCP connection limits
- Free tier: 10,000 requests/day - sufficient for dev/staging
- Sliding window algorithm maintains existing behavior

## Requirements

1. Create Upstash account and Redis database
2. Install @upstash/ratelimit and @upstash/redis
3. Replace lib/security/rate-limit.ts implementation
4. Update middleware.ts to use new rate limiter
5. Add environment variables
6. Implement graceful fallback if Redis unavailable

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   middleware.ts │────▶│ rate-limit.ts    │
└─────────────────┘     │ (Upstash Redis)  │
                        └────────┬─────────┘
                                 │ REST API
                                 ▼
                        ┌──────────────────┐
                        │  Upstash Redis   │
                        │  (Serverless)    │
                        └──────────────────┘
```

## Related Code Files

- `lib/security/rate-limit.ts` - Complete rewrite
- `middleware.ts` - Minor update for new API
- `.env.local` - Add Upstash credentials

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install @upstash/ratelimit @upstash/redis
```

### Step 2: Add Environment Variables
```env
# .env.local
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx
```

### Step 3: Rewrite lib/security/rate-limit.ts
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Lazy initialization to handle missing env vars gracefully
let ratelimitInstance: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (ratelimitInstance) return ratelimitInstance

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[RateLimit] Upstash credentials missing, rate limiting disabled')
    return null
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  ratelimitInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
    analytics: true,
    prefix: 'timeline:ratelimit',
  })

  return ratelimitInstance
}

// Pre-defined limit configurations
export const RATE_LIMITS = {
  STRICT: { requests: 10, window: '1 m' },   // 10 per minute (auth)
  DEFAULT: { requests: 60, window: '1 m' },  // 60 per minute
  GENEROUS: { requests: 200, window: '1 m' }, // 200 per minute
} as const

export type RateLimitConfig = typeof RATE_LIMITS[keyof typeof RATE_LIMITS]

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Rate limit check using Upstash Redis
 * Falls back to allowing requests if Redis unavailable
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): Promise<RateLimitResult> {
  const limiter = getRatelimit()

  // Fallback: allow if Redis not configured
  if (!limiter) {
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000
    }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    return { success, limit, remaining, reset }
  } catch (error) {
    console.error('[RateLimit] Redis error, allowing request:', error)
    // Fail open - allow request if Redis fails
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000
    }
  }
}

/**
 * Create custom rate limiter for specific endpoints
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (identifier: string) => rateLimit(identifier, config)
}
```

### Step 4: Update middleware.ts
```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit'

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const config = request.nextUrl.pathname.startsWith('/api/auth/')
      ? RATE_LIMITS.STRICT
      : RATE_LIMITS.DEFAULT

    const { success, limit, remaining, reset } = await rateLimit(ip, config)

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
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
          }
        }
      )
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Step 5: Create tests/integration/rate-limit.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit'

describe('rate-limit', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('allows requests within limit', async () => {
    const result = await rateLimit('test-ip', RATE_LIMITS.DEFAULT)
    expect(result.success).toBe(true)
    expect(result.remaining).toBeLessThanOrEqual(result.limit)
  })

  it('returns consistent headers', async () => {
    const result = await rateLimit('test-ip-2', RATE_LIMITS.STRICT)
    expect(result).toHaveProperty('limit')
    expect(result).toHaveProperty('remaining')
    expect(result).toHaveProperty('reset')
  })
})
```

## Todo List

- [ ] Create Upstash account and Redis database
- [ ] Install @upstash/ratelimit @upstash/redis
- [ ] Add UPSTASH_* env variables to .env.local
- [ ] Rewrite lib/security/rate-limit.ts
- [ ] Update middleware.ts
- [ ] Add Retry-After header to 429 responses
- [ ] Write integration tests
- [ ] Test rate limiting in dev environment
- [ ] Document env vars in README

## Success Criteria

- [ ] Rate limiting persists across server restarts
- [ ] 429 responses include proper headers
- [ ] Graceful fallback when Redis unavailable
- [ ] Tests pass
- [ ] Works in multi-instance deployment

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Upstash outage | Low | Medium | Fail-open fallback |
| Cold start latency | Medium | Low | Regional endpoint |
| Cost overrun | Low | Low | Monitor in dashboard |

## Security Considerations

- Store Upstash credentials in env vars only
- Never log Redis tokens
- Use IP-based limiting (not user ID for unauthenticated)

## Next Steps

After completion:
1. Monitor Upstash dashboard for usage
2. Proceed to Phase 03 (Audit Logging)
3. Consider per-user rate limits for authenticated routes
