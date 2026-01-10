/**
 * Redis-based rate limiter using Upstash for multi-instance compatibility.
 * Falls back to allowing requests if Redis is unavailable (fail-open).
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Lazy initialization to handle missing env vars gracefully
let ratelimitInstance: Ratelimit | null = null
let rateLimitStrict: Ratelimit | null = null
let rateLimitGenerous: Ratelimit | null = null

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

function getRatelimit(type: 'default' | 'strict' | 'generous' = 'default'): Ratelimit | null {
  const redis = getRedis()
  if (!redis) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[RateLimit] Upstash credentials missing, rate limiting disabled')
    }
    return null
  }

  switch (type) {
    case 'strict':
      if (!rateLimitStrict) {
        rateLimitStrict = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 per minute
          analytics: true,
          prefix: 'timeline:ratelimit:strict',
        })
      }
      return rateLimitStrict

    case 'generous':
      if (!rateLimitGenerous) {
        rateLimitGenerous = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(200, '1 m'), // 200 per minute
          analytics: true,
          prefix: 'timeline:ratelimit:generous',
        })
      }
      return rateLimitGenerous

    default:
      if (!ratelimitInstance) {
        ratelimitInstance = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 per minute
          analytics: true,
          prefix: 'timeline:ratelimit:default',
        })
      }
      return ratelimitInstance
  }
}

// Pre-defined limit configurations
export const RATE_LIMITS = {
  STRICT: { type: 'strict' as const, requests: 10, window: '1 m' },   // 10 per minute (auth)
  DEFAULT: { type: 'default' as const, requests: 60, window: '1 m' },  // 60 per minute
  GENEROUS: { type: 'generous' as const, requests: 200, window: '1 m' }, // 200 per minute
} as const

export type RateLimitType = 'strict' | 'default' | 'generous'

export interface RateLimitResult {
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
  config: typeof RATE_LIMITS[keyof typeof RATE_LIMITS] = RATE_LIMITS.DEFAULT
): Promise<RateLimitResult> {
  const limiter = getRatelimit(config.type)

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
export function createRateLimiter(config: typeof RATE_LIMITS[keyof typeof RATE_LIMITS]) {
  return (identifier: string) => rateLimit(identifier, config)
}
