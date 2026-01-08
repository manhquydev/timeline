/**
 * Simple in-memory cache with TTL support
 * For production with multiple instances, replace with Redis
 */

interface CacheEntry<T> {
  data: T
  expires: number
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    this.startCleanup()
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cached value with TTL (in seconds)
   */
  set<T>(key: string, data: T, ttlSeconds = 60): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidate(pattern: string | RegExp): number {
    let count = 0
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Invalidate all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    }
  }

  /**
   * Generate cache key from components
   */
  static key(...parts: (string | number | boolean | undefined | null)[]): string {
    return parts.filter(p => p !== undefined && p !== null).join(':')
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expires) {
          this.cache.delete(key)
        }
      }
    }, 5 * 60 * 1000)

    // Don't prevent Node from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
export const queryCache = new QueryCache()

// Cache key generators for common patterns
export const cacheKeys = {
  event: (id: string) => QueryCache.key('event', id),
  eventList: (status?: string) => QueryCache.key('events', status || 'all'),
  post: (id: string) => QueryCache.key('post', id),
  postsByEvent: (eventId: string, status?: string) => QueryCache.key('posts', eventId, status || 'all'),
  userPosts: (userId: string) => QueryCache.key('user-posts', userId),
  theme: (id: string) => QueryCache.key('theme', id),
  activeTheme: () => 'theme:active',
}

// Cache TTL constants (in seconds)
export const cacheTTL = {
  SHORT: 30,      // 30 seconds - frequently changing data
  MEDIUM: 60,     // 1 minute - moderate change frequency
  LONG: 300,      // 5 minutes - rarely changing data
  VERY_LONG: 900, // 15 minutes - static data
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl = cacheTTL.MEDIUM
): Promise<T> {
  const cached = queryCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const result = await fn()
  queryCache.set(key, result, ttl)
  return result
}
