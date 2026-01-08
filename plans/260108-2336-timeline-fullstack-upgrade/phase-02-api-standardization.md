# Phase 2: API Standardization

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 1 (Security) - validation layer
- **Docs:** [CLAUDE.md](../../CLAUDE.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-08 |
| Priority | P1 - High |
| Effort | 8h |
| Implementation Status | ✅ completed |
| Review Status | ✅ completed |

## Key Insights
- `lib/api-utils.ts` exists with basic response helpers
- Inconsistent usage across 33 API routes
- No centralized error handling
- No request logging/tracing
- No API versioning strategy

## Requirements
1. Standardize all API responses to consistent format
2. Create centralized error handling with error codes
3. Add request/response logging
4. Implement API versioning strategy
5. Create API documentation

## Architecture

### Standard Response Format
```typescript
// Success
{ success: true, data: T, meta?: { pagination, timing } }

// Error
{ success: false, error: { code: string, message: string, details?: any } }
```

### Error Codes
```typescript
// lib/api-utils.ts
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const
```

### API Handler Wrapper
```typescript
// lib/api-utils.ts
export function apiHandler<T>(
  handler: (req: NextRequest, ctx: ApiContext) => Promise<T>
) {
  return async (req: NextRequest, params: any) => {
    const startTime = Date.now()
    try {
      const result = await handler(req, { params, startTime })
      return apiResponse.success(result)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
```

## Related Code Files
- `lib/api-utils.ts` - Main file to enhance
- `app/api/**/route.ts` - All 33 API routes
- `middleware.ts` - Add request ID header

## Implementation Steps

### Step 1: Enhance API Utils (2h)
- [ ] Add ErrorCodes enum with all error types
- [ ] Create `ApiError` class with code, message, status
- [ ] Add `apiHandler` wrapper with try/catch
- [ ] Add timing metadata to responses
- [ ] Add request ID generation

### Step 2: Create Error Handling (1.5h)
- [ ] Create `handleApiError` function
- [ ] Map common errors to appropriate codes
- [ ] Add Mongoose error handling
- [ ] Add Supabase error handling
- [ ] Log errors with context

### Step 3: Migrate API Routes (3h)
- [ ] Update `/api/upload/route.ts`
- [ ] Update `/api/posts/*` routes (5 routes)
- [ ] Update `/api/admin/*` routes (10 routes)
- [ ] Update `/api/auth/*` routes (5 routes)
- [ ] Update remaining routes (13 routes)

### Step 4: Add Request Logging (1h)
- [ ] Create `lib/logging.ts` with structured logger
- [ ] Log request start with method, path, user
- [ ] Log response with status, timing
- [ ] Add request ID to all logs

### Step 5: API Versioning (0.5h)
- [ ] Document versioning strategy (URL path vs header)
- [ ] Add version to response headers
- [ ] Create migration guide for future breaking changes

## Todo List
- [ ] Enhance api-utils with ErrorCodes
- [ ] Create ApiError class
- [ ] Build apiHandler wrapper
- [ ] Migrate all 33 API routes
- [ ] Add structured logging
- [ ] Document API versioning

## Success Criteria
- [ ] All routes use apiHandler wrapper
- [ ] Consistent error format across all endpoints
- [ ] Request timing in response meta
- [ ] All errors logged with context
- [ ] API versioning documented

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking frontend clients | Medium | High | Keep response structure compatible |
| Migration introduces bugs | Medium | Medium | Test each route after migration |
| Performance overhead | Low | Low | Minimal wrapper overhead |

## Next Steps
After completion, Phase 3 (Database) can begin in parallel with Phase 4 (Frontend).
