import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, validateBody, validateQuery, type AdminContext } from '@/lib/api-utils'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth-utils'
import { updateUserRoleSchema, userIdQuerySchema } from '@/lib/validations'
import { logRoleChange, logUserDeletion } from '@/lib/services/audit-service'
import { adminLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/users
 * Fetch all users with their roles and stats
 */
export const GET = withAdmin(async (request: NextRequest, { user, supabase }: AdminContext) => {
  try {
    // Use admin client for privileged operations
    const adminClient = createAdminClient()

    // Fetch user profiles, roles, and auth data separately
    const [
      { data: profiles, error: profilesError },
      { data: roles, error: rolesError },
      { data: { users: authUsers }, error: authError }
    ] = await Promise.all([
      supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
      adminClient.auth.admin.listUsers()
    ])

    if (profilesError) throw profilesError
    if (rolesError) throw rolesError
    if (authError) throw authError

    // Create lookup maps for efficient joining
    const authUsersMap = new Map(authUsers.map(u => [u.id, u]))
    const rolesMap = new Map(roles?.map((r: any) => [r.user_id, r]) || [])

    // Combine data with JavaScript joins
    const usersWithDetails = profiles?.map((profile: any) => {
      const authUser = authUsersMap.get(profile.id)
      const userRole = rolesMap.get(profile.id)

      return {
        id: profile.id,
        email: authUser?.email || profile.email || 'N/A',
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: userRole?.role || 'user',
        total_uploads: profile.total_uploads,
        created_at: profile.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        email_confirmed_at: authUser?.email_confirmed_at || null,
      }
    }) || []

    return successResponse({
      users: usersWithDetails,
      total: usersWithDetails.length,
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error fetching users')
    return errorResponse(error.message || 'Failed to fetch users', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * PATCH /api/admin/users
 * Update user role (with peer-to-peer admin authorization)
 */
export const PATCH = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { data: body, error: bodyError } = await validateBody(request, updateUserRoleSchema)
    if (bodyError) return bodyError

    const { userId, role } = body

    // Security Check: Prevent self-demotion
    if (userId === user.id) {
      return errorResponse('Cannot change your own role. Ask another admin.', 403, ErrorCodes.FORBIDDEN)
    }

    // Get current user's role for audit logging
    const currentUserRole = await getUserRole(user.id)
    const targetUserRole = await getUserRole(userId)

    adminLogger.info(
      { adminEmail: user.email, adminRole: currentUserRole, targetUserId: userId, fromRole: targetUserRole, toRole: role },
      'Role change requested'
    )

    // Use admin client for the update to bypass RLS
    const adminClient = createAdminClient()

    const { data, error } = await (adminClient
      .from('user_roles') as any)
      .upsert({
        user_id: userId,
        role: role,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      adminLogger.error({ err: error }, 'Role change failed')
      throw error
    }

    // Audit log the role change
    await logRoleChange(request, { id: user.id, email: user.email! }, userId, targetUserRole, role)

    return successResponse({
      message: 'User role updated successfully',
      data,
      audit: {
        changed_by: user.email,
        changed_from: targetUserRole,
        changed_to: role,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error updating user role')
    return errorResponse(error.message || 'Failed to update user role', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * DELETE /api/admin/users?userId=xxx
 * Delete user (with admin authorization and audit logging)
 */
export const DELETE = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { data: params, error: queryError } = await validateQuery(request, userIdQuerySchema)
    if (queryError) return queryError

    const { userId } = params

    // Security Check: Prevent self-deletion
    if (userId === user.id) {
      return errorResponse('Cannot delete your own account', 400, ErrorCodes.VALIDATION_ERROR)
    }

    // Get target user's role for audit logging
    const targetUserRole = await getUserRole(userId)

    adminLogger.info(
      { adminEmail: user.email, targetUserId: userId, targetRole: targetUserRole },
      'User deletion requested'
    )

    // Use admin client to delete user (bypasses RLS)
    const adminClient = createAdminClient()

    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) throw error

    // Audit log the user deletion
    await logUserDeletion(request, { id: user.id, email: user.email! }, userId)

    return successResponse({
      message: 'User deleted successfully',
      audit: {
        deleted_by: user.email,
        deleted_user_role: targetUserRole,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error deleting user')
    return errorResponse(error.message || 'Failed to delete user', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
