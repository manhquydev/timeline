# Phase 05: Admin Authentication Middleware

## Context Links
- Parent: [plan.md](./plan.md)
- Scout: [scout-01-security-middleware.md](./scout/scout-01-security-middleware.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-10 |
| Priority | P1 - High |
| Effort | 2h |
| Implementation Status | pending |
| Review Status | pending |

Centralize admin authentication checks into reusable middleware/wrapper to reduce code duplication.

## Key Insights

- Every admin route repeats same pattern: getUser() → isCurrentUserAdmin() → return 403
- 15+ admin routes with duplicated auth logic
- Pattern is consistent but verbose (8-10 lines per route)
- Can create HOF (Higher Order Function) wrapper

## Requirements

1. Create admin route wrapper function
2. Extract common auth + validation pattern
3. Provide typed request context with user info
4. Support optional role requirements (admin vs super_admin)
5. Migrate existing admin routes to use wrapper

## Architecture

```
Before:
  export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized', 403)
    }
    // ... actual logic
  }

After:
  export const GET = withAdmin(async (request, context) => {
    const { user, supabase } = context
    // ... actual logic (user guaranteed to be admin)
  })
```

## Related Code Files

- `lib/api-utils.ts` - Add withAdmin wrapper
- `app/api/admin/users/route.ts` - Migrate
- `app/api/admin/events/route.ts` - Migrate
- `app/api/admin/posts/route.ts` - Migrate
- All other `app/api/admin/*` routes

## Implementation Steps

### Step 1: Create admin middleware wrapper in lib/api-utils.ts
```typescript
// Add to lib/api-utils.ts

import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin, isSuperAdmin, getUserRole, UserRole } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Admin context passed to route handlers
 */
export interface AdminContext {
  user: {
    id: string
    email: string
    role: UserRole
  }
  supabase: Awaited<ReturnType<typeof createClient>>
  request: NextRequest
}

/**
 * Options for admin route wrapper
 */
export interface AdminRouteOptions {
  requireSuperAdmin?: boolean
}

/**
 * Admin route handler type
 */
export type AdminRouteHandler = (
  request: NextRequest,
  context: AdminContext
) => Promise<NextResponse>

/**
 * Higher-order function to wrap admin API routes with auth checks
 *
 * @example
 * export const GET = withAdmin(async (request, { user, supabase }) => {
 *   // user is guaranteed to be admin
 *   return successResponse({ data: 'admin only' })
 * })
 *
 * @example
 * // Require super admin
 * export const DELETE = withAdmin(
 *   async (request, { user }) => {
 *     return successResponse({ deleted: true })
 *   },
 *   { requireSuperAdmin: true }
 * )
 */
export function withAdmin(
  handler: AdminRouteHandler,
  options: AdminRouteOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return errorResponse('Unauthorized: Authentication required', 401, ErrorCodes.UNAUTHORIZED)
      }

      // Check admin status
      const isAdmin = await isCurrentUserAdmin()
      if (!isAdmin) {
        return errorResponse('Forbidden: Admin access required', 403, ErrorCodes.FORBIDDEN)
      }

      // Check super admin if required
      if (options.requireSuperAdmin) {
        const isSuperAdminUser = await isSuperAdmin(user.id)
        if (!isSuperAdminUser) {
          return errorResponse('Forbidden: Super admin access required', 403, ErrorCodes.FORBIDDEN)
        }
      }

      // Get user role for context
      const role = await getUserRole(user.id)

      // Create context
      const context: AdminContext = {
        user: {
          id: user.id,
          email: user.email || '',
          role
        },
        supabase,
        request
      }

      // Call the actual handler
      return await handler(request, context)

    } catch (error: any) {
      console.error('[AdminRoute] Error:', error)
      return errorResponse(
        error.message || 'Internal server error',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }
  }
}

/**
 * Moderator route wrapper (moderator+ access)
 */
export function withModerator(
  handler: AdminRouteHandler
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return errorResponse('Unauthorized', 401, ErrorCodes.UNAUTHORIZED)
      }

      const role = await getUserRole(user.id)
      const hasAccess = ['moderator', 'admin', 'super_admin'].includes(role)

      if (!hasAccess) {
        return errorResponse('Forbidden: Moderator access required', 403, ErrorCodes.FORBIDDEN)
      }

      const context: AdminContext = {
        user: { id: user.id, email: user.email || '', role },
        supabase,
        request
      }

      return await handler(request, context)

    } catch (error: any) {
      console.error('[ModeratorRoute] Error:', error)
      return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
    }
  }
}
```

### Step 2: Migrate admin/users/route.ts
```typescript
// app/api/admin/users/route.ts - Before (abbreviated)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isCurrentUserAdmin())) {
    return errorResponse('Unauthorized', 403, ErrorCodes.FORBIDDEN)
  }
  // ... logic
}

// After
import { withAdmin, successResponse, errorResponse } from '@/lib/api-utils'

export const GET = withAdmin(async (request, { user, supabase }) => {
  const adminClient = createAdminClient()

  // Fetch user profiles, roles, and auth data
  const [
    { data: profiles, error: profilesError },
    { data: roles, error: rolesError },
    { data: { users: authUsers }, error: authError }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('user_roles').select('*'),
    adminClient.auth.admin.listUsers()
  ])

  // ... rest of logic

  return successResponse({ users: usersWithDetails, total: usersWithDetails.length })
})

export const PATCH = withAdmin(async (request, { user }) => {
  const { data: body, error: bodyError } = await validateBody(request, updateUserRoleSchema)
  if (bodyError) return bodyError

  const { userId, role } = body

  // Prevent self-demotion
  if (userId === user.id) {
    return errorResponse('Cannot change your own role', 403, ErrorCodes.FORBIDDEN)
  }

  // ... rest of logic

  return successResponse({ message: 'User role updated', data })
})

export const DELETE = withAdmin(async (request, { user }) => {
  const { data: params, error: queryError } = await validateQuery(request, userIdQuerySchema)
  if (queryError) return queryError

  const { userId } = params

  if (userId === user.id) {
    return errorResponse('Cannot delete yourself', 400, ErrorCodes.VALIDATION_ERROR)
  }

  // ... rest of logic

  return successResponse({ message: 'User deleted' })
})
```

### Step 3: Migration pattern for other routes
```typescript
// Pattern for migrating any admin route:

// 1. Replace function export with withAdmin wrapper
// Before:
export async function GET(request: NextRequest) {
  // auth boilerplate
  // logic
}

// After:
export const GET = withAdmin(async (request, { user, supabase }) => {
  // logic only - auth handled by wrapper
})

// 2. Remove auth boilerplate (these lines):
// - const supabase = await createClient()
// - const { data: { user } } = await supabase.auth.getUser()
// - if (!user || !(await isCurrentUserAdmin())) { return ... }

// 3. Use context.user instead of fetching user
// 4. Use context.supabase instead of creating client
```

### Step 4: Create migration checklist
Routes to migrate:
- [ ] app/api/admin/users/route.ts
- [ ] app/api/admin/events/route.ts
- [ ] app/api/admin/posts/route.ts
- [ ] app/api/admin/themes/route.ts
- [ ] app/api/admin/themes/seed/route.ts
- [ ] app/api/admin/themes/[id]/route.ts
- [ ] app/api/admin/team/route.ts
- [ ] app/api/admin/settings/route.ts
- [ ] app/api/admin/activities/route.ts
- [ ] app/api/admin/workflows/route.ts
- [ ] app/api/admin/cleanup/route.ts

## Todo List

- [ ] Add withAdmin and withModerator to lib/api-utils.ts
- [ ] Add AdminContext interface and types
- [ ] Migrate app/api/admin/users/route.ts
- [ ] Migrate app/api/admin/events/route.ts
- [ ] Migrate app/api/admin/posts/route.ts
- [ ] Migrate remaining admin routes (8 more)
- [ ] Write unit test for withAdmin wrapper
- [ ] Test all admin routes still work
- [ ] Update any route-specific error handling

## Success Criteria

- [ ] All admin routes use withAdmin wrapper
- [ ] No duplicate auth code in admin routes
- [ ] Existing functionality preserved
- [ ] Error responses consistent
- [ ] TypeScript types correct

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing routes | Medium | High | Test each route after migration |
| Error handling changes | Low | Medium | Preserve route-specific error messages |
| Type inference issues | Low | Low | Explicit AdminContext type |

## Security Considerations

- Wrapper must fail closed (deny by default)
- Log auth failures for monitoring
- Preserve audit logging in routes

## Next Steps

After completion:
1. Run full test suite
2. Manual testing of admin panel
3. Proceed to Phase 06 (Pino Logging)
