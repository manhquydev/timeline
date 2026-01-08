import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin, getUserRole } from '@/lib/auth-utils'
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, ErrorCodes, validateBody, validateQuery } from '@/lib/api-utils'
import { updateUserRoleSchema, userIdQuerySchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

// GET - Fetch all users with their roles and stats
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

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
    console.error('Error fetching users:', error)
    return errorResponse(error.message || 'Failed to fetch users', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

// PATCH - Update user role (with peer-to-peer admin authorization)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

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

    console.log(`[ROLE_CHANGE] Admin ${user.email} (${currentUserRole}) changing user ${userId} from ${targetUserRole} to ${role}`)

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
      console.error('[ROLE_CHANGE_ERROR]', error)
      throw error
    }

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
    console.error('Error updating user role:', error)
    return errorResponse(error.message || 'Failed to update user role', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

// DELETE - Delete user (with admin authorization and audit logging)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: params, error: queryError } = await validateQuery(request, userIdQuerySchema)
    if (queryError) return queryError

    const { userId } = params

    // Security Check: Prevent self-deletion
    if (userId === user.id) {
      return errorResponse('Cannot delete your own account', 400, ErrorCodes.VALIDATION_ERROR)
    }

    // Get target user's role for audit logging
    const targetUserRole = await getUserRole(userId)

    console.log(`[USER_DELETE] Admin ${user.email} deleting user ${userId} (role: ${targetUserRole})`)

    // Use admin client to delete user (bypasses RLS)
    const adminClient = createAdminClient()

    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) throw error

    return successResponse({
      message: 'User deleted successfully',
      audit: {
        deleted_by: user.email,
        deleted_user_role: targetUserRole,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return errorResponse(error.message || 'Failed to delete user', 500, ErrorCodes.INTERNAL_ERROR)
  }
}
