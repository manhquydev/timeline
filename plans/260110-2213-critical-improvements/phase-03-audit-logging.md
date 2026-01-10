# Phase 03: Persistent Audit Logging

## Context Links
- Parent: [plan.md](./plan.md)
- Research: [researcher-02-redis-logging.md](./research/researcher-02-redis-logging.md)
- Scout: [scout-02-mongodb-types.md](./scout/scout-02-mongodb-types.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-10 |
| Priority | P0 - Critical |
| Effort | 2h |
| Implementation Status | pending |
| Review Status | pending |

Implement persistent audit logging to MongoDB using existing AuditLog model and repository.

## Key Insights

- AuditLog model already exists at `lib/mongodb/models/AuditLog.ts`
- AuditLogRepository exists at `lib/mongodb/repositories/AuditLogRepository.ts`
- Current logging uses console.log - not persisted
- Need to integrate audit logging into admin API routes

## Requirements

1. Verify AuditLog model has required fields
2. Create audit logging service/helper
3. Integrate into admin routes (users, events, posts)
4. Add IP address and user agent capture
5. Create admin UI for viewing audit logs

## Architecture

```
API Route ──▶ auditService.log() ──▶ AuditLogRepository ──▶ MongoDB
                    │
                    ├── userId
                    ├── action
                    ├── resourceId
                    ├── ipAddress
                    └── details
```

## Related Code Files

- `lib/mongodb/models/AuditLog.ts` - Existing model
- `lib/mongodb/repositories/AuditLogRepository.ts` - Existing repository
- `app/api/admin/users/route.ts` - Add audit logging
- `app/api/admin/events/route.ts` - Add audit logging
- `app/api/admin/posts/route.ts` - Add audit logging

## Implementation Steps

### Step 1: Review and enhance AuditLog model
```typescript
// lib/mongodb/models/AuditLog.ts - Ensure these fields exist
export const AuditActions = {
  // Auth
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',

  // Admin - Users
  USER_ROLE_CHANGE: 'USER_ROLE_CHANGE',
  USER_DELETE: 'USER_DELETE',

  // Admin - Events
  EVENT_CREATE: 'EVENT_CREATE',
  EVENT_UPDATE: 'EVENT_UPDATE',
  EVENT_DELETE: 'EVENT_DELETE',

  // Admin - Posts
  POST_APPROVE: 'POST_APPROVE',
  POST_REJECT: 'POST_REJECT',
  POST_DELETE: 'POST_DELETE',

  // Settings
  SETTINGS_CHANGE: 'SETTINGS_CHANGE',
  THEME_ACTIVATE: 'THEME_ACTIVATE',
} as const

export type AuditAction = typeof AuditActions[keyof typeof AuditActions]
```

### Step 2: Create audit logging service
```typescript
// lib/services/audit-service.ts
import { auditLogRepository } from '@/lib/mongodb/repositories'
import { AuditAction } from '@/lib/mongodb/models/AuditLog'
import { NextRequest } from 'next/server'

interface AuditLogInput {
  action: AuditAction
  userId?: string
  actorName?: string
  resourceId?: string
  resourceType?: string
  status: 'success' | 'failure'
  details?: Record<string, any>
}

/**
 * Extract client info from request
 */
export function getClientInfo(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1',
    userAgent: request.headers.get('user-agent') || 'unknown'
  }
}

/**
 * Log an audit event
 */
export async function logAudit(
  input: AuditLogInput,
  request?: NextRequest
): Promise<void> {
  try {
    const clientInfo = request ? getClientInfo(request) : {}

    await auditLogRepository.create({
      ...input,
      ...clientInfo,
      timestamp: new Date()
    })
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    console.error('[AuditService] Failed to log audit event:', error)
  }
}

/**
 * Log admin action helper
 */
export async function logAdminAction(
  request: NextRequest,
  action: AuditAction,
  details: {
    adminUserId: string
    adminEmail: string
    resourceId?: string
    resourceType?: string
    changes?: { before?: any; after?: any }
  }
): Promise<void> {
  await logAudit({
    action,
    userId: details.adminUserId,
    actorName: details.adminEmail,
    resourceId: details.resourceId,
    resourceType: details.resourceType,
    status: 'success',
    details: details.changes
  }, request)
}
```

### Step 3: Update admin/users/route.ts
```typescript
// Add to PATCH handler after successful role update
import { logAdminAction } from '@/lib/services/audit-service'
import { AuditActions } from '@/lib/mongodb/models/AuditLog'

// In PATCH handler, after successful update:
await logAdminAction(request, AuditActions.USER_ROLE_CHANGE, {
  adminUserId: user.id,
  adminEmail: user.email!,
  resourceId: userId,
  resourceType: 'User',
  changes: {
    before: { role: targetUserRole },
    after: { role: role }
  }
})

// In DELETE handler, after successful deletion:
await logAdminAction(request, AuditActions.USER_DELETE, {
  adminUserId: user.id,
  adminEmail: user.email!,
  resourceId: userId,
  resourceType: 'User',
  changes: {
    before: { role: targetUserRole }
  }
})
```

### Step 4: Update admin/events/route.ts
```typescript
// Add to POST handler after event creation
await logAdminAction(request, AuditActions.EVENT_CREATE, {
  adminUserId: user.id,
  adminEmail: user.email!,
  resourceId: event.id,
  resourceType: 'Event',
  changes: { after: { title: event.title, slug: event.slug } }
})

// Add to DELETE handler
await logAdminAction(request, AuditActions.EVENT_DELETE, {
  adminUserId: user.id,
  adminEmail: user.email!,
  resourceId: eventId,
  resourceType: 'Event',
  changes: { before: { title: event?.title } }
})
```

### Step 5: Update admin/posts/route.ts
```typescript
// Add to PATCH handler for post approval/rejection
const actionType = status === 'approved'
  ? AuditActions.POST_APPROVE
  : AuditActions.POST_REJECT

await logAdminAction(request, actionType, {
  adminUserId: user.id,
  adminEmail: user.email!,
  resourceId: postId,
  resourceType: 'Post',
  changes: { before: { status: oldStatus }, after: { status } }
})
```

### Step 6: Create API route for fetching audit logs
```typescript
// app/api/admin/audit-logs/route.ts
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { auditLogRepository } from '@/lib/mongodb/repositories'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await isCurrentUserAdmin())) {
    return errorResponse('Unauthorized', 403, ErrorCodes.FORBIDDEN)
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const action = searchParams.get('action')
  const userId = searchParams.get('userId')

  const filter: any = {}
  if (action) filter.action = action
  if (userId) filter.userId = userId

  const logs = await auditLogRepository.findLean(filter, {
    sort: { timestamp: -1 },
    limit: Math.min(limit, 100)
  })

  return successResponse({ logs, total: logs.length })
}
```

## Todo List

- [ ] Verify AuditLog model has all required fields
- [ ] Create lib/services/audit-service.ts
- [ ] Update app/api/admin/users/route.ts with audit logging
- [ ] Update app/api/admin/events/route.ts with audit logging
- [ ] Update app/api/admin/posts/route.ts with audit logging
- [ ] Create app/api/admin/audit-logs/route.ts
- [ ] Test audit logging in admin actions
- [ ] Verify logs persist in MongoDB

## Success Criteria

- [ ] All admin actions logged to MongoDB
- [ ] Logs include IP address and user agent
- [ ] Logs include before/after changes
- [ ] Audit logs API returns paginated results
- [ ] No performance impact on admin routes

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MongoDB write failure | Low | Low | Fail silently, log to console |
| Large audit log collection | Medium | Low | Add TTL index for auto-cleanup |
| PII in logs | Medium | Medium | Only log IDs, not full user data |

## Security Considerations

- Audit logs should be immutable (no update/delete endpoints)
- Only super_admin should access full audit logs
- Consider encrypting sensitive details field
- Add TTL index for GDPR compliance (e.g., 90 days)

## Next Steps

After completion:
1. Add MongoDB TTL index for audit_logs
2. Create admin UI page for viewing logs
3. Proceed to Phase 04 (Blurhash Fix)
