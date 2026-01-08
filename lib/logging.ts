type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  userId?: string
  path?: string
  method?: string
  duration?: number
  statusCode?: number
  userAgent?: string
  ip?: string
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  context: LogContext
  timestamp: string
  service: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel]
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'development') {
    // Human-readable format for development
    const contextStr = Object.entries(entry.context)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(' ')
    return `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.message} ${contextStr}`
  }
  // JSON format for production (better for log aggregation)
  return JSON.stringify(entry)
}

function log(level: LogLevel, message: string, context: LogContext = {}): void {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    service: 'timeline-api',
  }

  const output = formatLog(entry)

  switch (level) {
    case 'error':
      console.error(output)
      break
    case 'warn':
      console.warn(output)
      break
    default:
      console.log(output)
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),

  // Request logging helpers
  requestStart: (requestId: string, method: string, path: string, context?: LogContext) => {
    log('info', 'Request started', { requestId, method, path, ...context })
  },

  requestEnd: (
    requestId: string,
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) => {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    log(level, 'Request completed', { requestId, method, path, statusCode, duration, ...context })
  },

  // Error logging with stack trace
  logError: (error: Error, context?: LogContext) => {
    log('error', error.message, {
      ...context,
      errorName: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  },
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}
