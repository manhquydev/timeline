import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend global object with mongoose cache for Next.js hot reloading
declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

/**
 * Retry configuration for database connection
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 5000,
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function getRetryDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt)
  const jitter = Math.random() * 500
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs)
}

/**
 * Connect to MongoDB with connection pooling and retry logic
 * Uses cached connection in development to prevent hot reload issues
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Get MongoDB URI at connection time (not at module load time)
  const MONGODB_URI = process.env.MONGODB_URI

  // Check for MongoDB URI
  if (!MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    // Connection with retry logic
    cached.promise = (async () => {
      let lastError: Error | null = null

      for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
        try {
          const conn = await mongoose.connect(MONGODB_URI, opts)
          return conn
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))

          // Don't retry on the last attempt
          if (attempt < RETRY_CONFIG.maxRetries - 1) {
            const delay = getRetryDelay(attempt)
            console.warn(
              `[MongoDB] Connection attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
              lastError.message
            )
            await sleep(delay)
          }
        }
      }

      throw lastError || new Error('MongoDB connection failed after retries')
    })()
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

/**
 * Disconnect from MongoDB
 * Use this for cleanup in serverless functions if needed
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect()
    cached.conn = null
    cached.promise = null
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus(): string {
  if (!cached.conn) return 'disconnected'

  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }

  return states[mongoose.connection.readyState] || 'unknown'
}
