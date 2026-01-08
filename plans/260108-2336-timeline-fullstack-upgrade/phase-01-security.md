# Phase 1: Security Hardening

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** None (first phase)
- **Docs:** [CLAUDE.md](../../CLAUDE.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-08 |
| Priority | P0 - Critical |
| Effort | 10h |
| Implementation Status | ✅ completed |
| Review Status | ✅ completed |

## Key Insights
- Zod installed but unused in API routes
- No CSRF protection for state-changing operations
- No security headers configured
- File upload accepts any type without validation
- Rate limiting exists but only IP-based

## Requirements
1. Add Zod validation to all API routes
2. Implement CSRF protection for mutations
3. Configure security headers (CSP, HSTS, X-Frame-Options)
4. Validate file uploads (type, size, content)
5. Audit and strengthen Supabase RLS policies

## Architecture

### Zod Validation Layer
```
lib/validations/
├── index.ts           # Re-exports all schemas
├── common.ts          # Shared schemas (pagination, id)
├── auth.ts            # Auth-related schemas
├── posts.ts           # Post CRUD schemas
├── events.ts          # Event schemas
├── upload.ts          # File upload schemas
└── admin.ts           # Admin operation schemas
```

### CSRF Protection
```typescript
// lib/security/csrf.ts
- Generate token on session start
- Validate token on POST/PATCH/DELETE
- Store in httpOnly cookie + validate header
```

### Security Headers
```typescript
// next.config.js headers
Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, Permissions-Policy, Strict-Transport-Security
```

## Related Code Files
- `lib/api-utils.ts` - Extend with validation wrapper
- `middleware.ts` - Add CSRF validation
- `next.config.js` - Add security headers
- `app/api/upload/route.ts` - Add file validation
- `lib/security/rate-limit.ts` - Extend with user-based limits

## Implementation Steps

### Step 1: Create Zod Validation Schemas (2h)
- [ ] Create `lib/validations/` directory structure
- [ ] Define common schemas (id, pagination, dates)
- [ ] Define schemas for each API domain (posts, events, auth, admin)
- [ ] Export validation helper `validateRequest<T>(schema, data)`

### Step 2: Add Validation to API Routes (3h)
- [ ] Update `lib/api-utils.ts` with `withValidation` wrapper
- [ ] Apply validation to `/api/upload` route
- [ ] Apply validation to `/api/posts/*` routes
- [ ] Apply validation to `/api/admin/*` routes
- [ ] Apply validation to `/api/auth/*` routes

### Step 3: Implement CSRF Protection (2h)
- [ ] Create `lib/security/csrf.ts` with token generation
- [ ] Add CSRF token to session/cookie on auth
- [ ] Create middleware check for POST/PATCH/DELETE
- [ ] Add `X-CSRF-Token` header requirement to frontend fetch

### Step 4: Configure Security Headers (1h)
- [ ] Add headers config to `next.config.js`
- [ ] Configure CSP for Supabase domains
- [ ] Add HSTS with preload
- [ ] Test with securityheaders.com

### Step 5: File Upload Hardening (1.5h)
- [ ] Create allowed MIME types whitelist
- [ ] Add magic byte validation (not just extension)
- [ ] Enforce max file size (already 10MB, verify)
- [ ] Sanitize filenames

### Step 6: RLS Policy Audit (0.5h)
- [ ] Document current RLS policies
- [ ] Verify user_roles policies prevent escalation
- [ ] Test cross-user data access prevention

## Todo List
- [ ] Create validation schemas
- [ ] Wrap API routes with validation
- [ ] Implement CSRF token flow
- [ ] Add security headers
- [ ] Harden file uploads
- [ ] Audit RLS policies
- [ ] Test all security measures

## Success Criteria
- [ ] All API routes validate input with Zod
- [ ] CSRF token required for all mutations
- [ ] Security headers score A+ on securityheaders.com
- [ ] File uploads reject invalid types/sizes
- [ ] No RLS bypass vulnerabilities

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing clients | Medium | High | Add validation errors with clear messages |
| CSRF breaks legitimate requests | Low | High | Test thoroughly before deploy |
| CSP blocks Supabase | Medium | Medium | Whitelist Supabase domains |

## Security Considerations
- Store CSRF tokens in httpOnly cookies
- Use constant-time comparison for tokens
- Log validation failures for monitoring
- Rate limit by user ID after auth, not just IP
