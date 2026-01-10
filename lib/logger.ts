/**
 * Structured logging with Pino
 * - JSON output in production for log aggregation
 * - Pretty output in development for readability
 * - Sensitive data redaction
 * - Domain-specific child loggers
 */

import pino from 'pino'

// Determine log level from environment
const level = process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

// Create base logger configuration
const baseConfig: pino.LoggerOptions = {
  level,
  base: {
    env: process.env.NODE_ENV,
    service: 'timeline-api',
  },
  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]'
  },
  // Custom serializers
  serializers: {
    error: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
    }),
  },
}

// Create logger instance
// Note: pino-pretty transport only works in Node.js, not in Edge runtime
export const logger = pino(baseConfig)

// Domain-specific child loggers for organized logging
export const authLogger = logger.child({ domain: 'auth' })
export const adminLogger = logger.child({ domain: 'admin' })
export const uploadLogger = logger.child({ domain: 'upload' })
export const dbLogger = logger.child({ domain: 'database' })
export const apiLogger = logger.child({ domain: 'api' })

/**
 * Create a request-scoped logger with context
 */
export function createRequestLogger(requestId: string, path: string) {
  return logger.child({ requestId, path })
}

/**
 * Log levels reference:
 * - fatal: System is unusable
 * - error: Error conditions
 * - warn: Warning conditions
 * - info: Informational messages
 * - debug: Debug-level messages
 * - trace: Trace-level messages
 */

// Export types
export type Logger = typeof logger
