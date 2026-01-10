# Phase 06: Structured Logging with Pino

## Context Links
- Parent: [plan.md](./plan.md)
- Research: [researcher-02-redis-logging.md](./research/researcher-02-redis-logging.md)
- Depends on: [Phase 03 - Audit Logging](./phase-03-audit-logging.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-10 |
| Priority | P2 - Medium |
| Effort | 2h |
| Implementation Status | pending |
| Review Status | pending |

Replace 88 console.log/error/warn statements with structured Pino logger.

## Key Insights

- 88 console statements in API routes
- No structured logging currently
- Sentry already integrated for error tracking
- Pino is fastest JSON logger for Node.js
- pino-pretty for dev, JSON for production

## Requirements

1. Install pino and pino-pretty
2. Create centralized logger module
3. Replace console statements with logger
4. Configure log levels per environment
5. Add request context (requestId, path)
6. Integrate with existing Sentry

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   API Route     │────▶│  logger.info()   │
└─────────────────┘     └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
           ┌─────────────┐           ┌─────────────┐
           │ Development │           │ Production  │
           │ pino-pretty │           │ JSON stdout │
           │ (colorized) │           │ → Sentry    │
           └─────────────┘           └─────────────┘
```

## Related Code Files

- `lib/logging.ts` - New logger module (or enhance existing)
- `app/api/**/*.ts` - All API routes
- `next.config.ts` - Enable instrumentation hook
- `instrumentation.ts` - Server startup logging

## Implementation Steps

### Step 1: Install dependencies
```bash
npm install pino pino-pretty
```

### Step 2: Create lib/logger.ts
```typescript
import pino from 'pino'

// Determine log level from environment
const level = process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

// Transport configuration
const transport = process.env.NODE_ENV === 'development'
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      }
    }
  : undefined // JSON output in production

// Create logger instance
export const logger = pino({
  level,
  transport,
  base: {
    env: process.env.NODE_ENV,
    service: 'timeline-api',
  },
  // Redact sensitive fields
  redact: {
    paths: ['password', 'token', 'authorization', 'cookie'],
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
})

// Child loggers for specific domains
export const authLogger = logger.child({ domain: 'auth' })
export const adminLogger = logger.child({ domain: 'admin' })
export const uploadLogger = logger.child({ domain: 'upload' })
export const dbLogger = logger.child({ domain: 'database' })

// Helper to create request-scoped logger
export function createRequestLogger(requestId: string, path: string) {
  return logger.child({ requestId, path })
}

// Export types for TypeScript
export type Logger = typeof logger
```

### Step 3: Create request ID middleware helper
```typescript
// lib/request-context.ts
import { nanoid } from 'nanoid'
import { NextRequest } from 'next/server'

export function getRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || nanoid(12)
}

export function getRequestContext(request: NextRequest) {
  return {
    requestId: getRequestId(request),
    path: request.nextUrl.pathname,
    method: request.method,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  }
}
```

### Step 4: Update API routes pattern
```typescript
// Before:
console.log('[ROLE_CHANGE] Admin', user.email, 'changing role for', userId)
console.error('Error fetching users:', error)

// After:
import { adminLogger } from '@/lib/logger'

adminLogger.info({
  action: 'ROLE_CHANGE',
  adminEmail: user.email,
  targetUserId: userId,
  fromRole: targetUserRole,
  toRole: newRole
}, 'Admin changing user role')

adminLogger.error({ err: error, userId }, 'Failed to fetch users')
```

### Step 5: Create logging utility for API routes
```typescript
// lib/api-logger.ts
import { NextRequest } from 'next/server'
import { logger } from './logger'
import { getRequestContext } from './request-context'

/**
 * Create a logger for API route with request context
 */
export function createApiLogger(request: NextRequest, domain?: string) {
  const context = getRequestContext(request)
  return domain
    ? logger.child({ ...context, domain })
    : logger.child(context)
}

/**
 * Log API request/response (for debugging)
 */
export function logApiCall(
  request: NextRequest,
  response: { status: number },
  durationMs: number
) {
  const context = getRequestContext(request)

  const logLevel = response.status >= 500 ? 'error'
    : response.status >= 400 ? 'warn'
    : 'info'

  logger[logLevel]({
    ...context,
    status: response.status,
    durationMs
  }, `${context.method} ${context.path}`)
}
```

### Step 6: Migration script (find and replace patterns)
```typescript
// Common replacements:

// console.log('message') → logger.info('message')
// console.error('Error:', error) → logger.error({ err: error }, 'message')
// console.warn('Warning') → logger.warn('Warning')

// With context:
// console.log('[DOMAIN] action', data) → domainLogger.info({ data }, 'action')
```

### Step 7: Update next.config.ts for instrumentation
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // ... other config
}
```

### Step 8: Create instrumentation.ts
```typescript
// instrumentation.ts
import { logger } from '@/lib/logger'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    logger.info({
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
    }, 'Server starting')
  }
}
```

### Step 9: Add LOG_LEVEL to environment
```env
# .env.local
LOG_LEVEL=debug

# .env.production
LOG_LEVEL=info
```

## Todo List

- [ ] Install pino and pino-pretty
- [ ] Create lib/logger.ts with domain loggers
- [ ] Create lib/request-context.ts
- [ ] Create lib/api-logger.ts
- [ ] Update next.config.ts with instrumentationHook
- [ ] Create instrumentation.ts
- [ ] Migrate app/api/admin/users/route.ts
- [ ] Migrate app/api/admin/events/route.ts
- [ ] Migrate app/api/upload/route.ts
- [ ] Migrate remaining API routes (batch)
- [ ] Add LOG_LEVEL to env examples
- [ ] Test logging in dev and production modes

## Success Criteria

- [ ] All console.* replaced with logger.*
- [ ] Logs include requestId for tracing
- [ ] Pretty logs in development
- [ ] JSON logs in production
- [ ] Sensitive data redacted
- [ ] No performance degradation

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Missing log statements | Medium | Low | Grep for remaining console.* |
| Log volume too high | Medium | Low | Set appropriate log level |
| Pino import issues | Low | Medium | Test in both dev/prod |

## Security Considerations

- Redact passwords, tokens, authorization headers
- Don't log full request bodies with PII
- Log user IDs, not emails in production
- Ensure logs don't contain secrets

## Next Steps

After completion:
1. Set up log aggregation (optional: Datadog, Logtail)
2. Create dashboard for log analysis
3. Add performance logging for slow queries
4. Consider structured error boundaries
