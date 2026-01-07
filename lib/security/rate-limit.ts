/**
 * Simple sliding-window rate limiter implementation for Next.js middleware.
 * This implementation uses an in-memory Map for storage.
 * In a distributed environment, this should be replaced with a Redis-based store.
 */

interface RateLimitConfig {
    interval: number // milliseconds
    max: number // max requests per interval
}

interface RateLimitRecord {
    timestamps: number[]
}

const stores = new Map<string, RateLimitRecord>()

export function rateLimit(identifier: string, config: RateLimitConfig) {
    const now = Date.now()
    const windowStart = now - config.interval

    const record = stores.get(identifier) || { timestamps: [] }

    // Clean up old timestamps
    record.timestamps = record.timestamps.filter(t => t > windowStart)

    if (record.timestamps.length >= config.max) {
        return {
            success: false,
            limit: config.max,
            remaining: 0,
            reset: record.timestamps[0] + config.interval
        }
    }

    record.timestamps.push(now)
    stores.set(identifier, record)

    return {
        success: true,
        limit: config.max,
        remaining: config.max - record.timestamps.length,
        reset: now + config.interval
    }
}

// Pre-defined limits
export const RATE_LIMITS = {
    STRICT: { interval: 60 * 1000, max: 10 }, // 10 per minute (for auth)
    DEFAULT: { interval: 60 * 1000, max: 60 }, // 60 per minute
    GENEROUS: { interval: 60 * 1000, max: 200 } // 200 per minute
}
