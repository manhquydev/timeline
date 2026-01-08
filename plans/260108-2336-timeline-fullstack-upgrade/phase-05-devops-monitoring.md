# Phase 5: DevOps & Monitoring

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 1-4 (all features to monitor)
- **Docs:** [CLAUDE.md](../../CLAUDE.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-08 |
| Priority | P2 - Medium |
| Effort | 6h |
| Implementation Status | pending |
| Review Status | pending |

## Key Insights
- Vercel deployment already configured
- No error tracking (Sentry)
- No structured logging
- No health check endpoints
- PWA caching exists but needs tuning
- No staging environment

## Requirements
1. Integrate Sentry for error tracking
2. Add health check endpoints
3. Implement structured logging
4. Configure Vercel optimization
5. Set up staging environment
6. Add performance monitoring

## Architecture

### Sentry Integration
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
})

// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
})
```

### Health Check Response
```typescript
// GET /api/health
{
  status: 'healthy' | 'degraded' | 'unhealthy',
  timestamp: ISO8601,
  version: string,
  checks: {
    mongodb: { status, latency },
    supabase: { status, latency },
  }
}
```

### Structured Logging
```typescript
// lib/logging.ts
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context: {
    requestId?: string
    userId?: string
    path?: string
    duration?: number
  }
  timestamp: string
}
```

## Related Code Files
- `next.config.js` - Sentry webpack config
- `middleware.ts` - Request logging
- `lib/api-utils.ts` - Error logging
- `package.json` - Add Sentry deps

## Implementation Steps

### Step 1: Sentry Integration (2h)
- [ ] Install `@sentry/nextjs`
- [ ] Run `npx @sentry/wizard@latest -i nextjs`
- [ ] Configure client and server configs
- [ ] Add source map upload
- [ ] Test error capture
- [ ] Add user context to errors

### Step 2: Health Check Endpoint (1h)
- [ ] Create `/api/health/route.ts`
- [ ] Add MongoDB connection check
- [ ] Add Supabase connection check
- [ ] Return structured status
- [ ] Add version from package.json

### Step 3: Structured Logging (1h)
- [ ] Create `lib/logging.ts`
- [ ] Define log levels and format
- [ ] Add request ID generation
- [ ] Integrate with API handler
- [ ] Add log sampling for high-volume

### Step 4: Vercel Optimization (1h)
- [ ] Review vercel.json config
- [ ] Configure edge functions where beneficial
- [ ] Optimize ISR for event pages
- [ ] Add caching headers
- [ ] Configure preview deployments

### Step 5: Staging Environment (1h)
- [ ] Create staging branch
- [ ] Configure Vercel staging project
- [ ] Set up staging env variables
- [ ] Add staging MongoDB database
- [ ] Document deployment flow

## Todo List
- [ ] Install and configure Sentry
- [ ] Create health check endpoint
- [ ] Implement structured logging
- [ ] Optimize Vercel config
- [ ] Set up staging environment
- [ ] Document monitoring procedures

## Success Criteria
- [ ] Sentry captures all unhandled errors
- [ ] Health endpoint < 500ms response
- [ ] Logs include request context
- [ ] Staging mirrors production setup
- [ ] Source maps uploaded to Sentry

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sentry quota exceeded | Medium | Low | Set sample rates appropriately |
| Health check adds latency | Low | Low | Cache results briefly |
| Logging performance impact | Low | Low | Async logging, sampling |

## Monitoring Dashboard
After Sentry setup, configure:
- Error rate alerts (> 1% of requests)
- Performance degradation alerts
- Weekly error summary emails
- Release tracking

## Environment Variables to Add
```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=timeline
SENTRY_PROJECT=timeline-web

# Staging
STAGING_MONGODB_URI=mongodb+srv://...
```

## Deployment Flow
```
main branch → Production (Vercel)
staging branch → Staging (Vercel Preview)
feature/* → Preview deployments
```
