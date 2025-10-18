import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin, getUserRole } from '@/lib/auth-utils'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Fetch all users with their roles and stats
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Use admin client for privileged operations
    const adminClient = createAdminClient()

    // Fetch user profiles, roles, and auth data separately (no foreign key relationship required)
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

    return NextResponse.json({
      users: usersWithDetails,
      total: usersWithDetails.length,
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PATCH - Update user role (with peer-to-peer admin authorization)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, role' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['user', 'moderator', 'admin', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // ⚠️ Security Check: Prevent self-demotion
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role. Ask another admin to do it.' },
        { status: 403 }
      )
    }

    // Get current user's role for audit logging
    const currentUserRole = await getUserRole(user.id)

    // Get target user's current role
    const targetUserRole = await getUserRole(userId)

    // Log role change for audit trail
    console.log(`[ROLE_CHANGE] Admin ${user.email} (${currentUserRole}) changing user ${userId} from ${targetUserRole} to ${role}`)

    // Use admin client for the update to bypass RLS
    const adminClient = createAdminClient()

    // Update user role with created_by tracking
    const { data, error } = await (adminClient
      .from('user_roles') as any)
      .upsert({
        user_id: userId,
        role: role,
        created_by: user.id, // Track who made the change
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id' // Specify conflict column
      })
      .select()
      .single()

    if (error) {
      console.error('[ROLE_CHANGE_ERROR]', error)
      throw error
    }

    return NextResponse.json({
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
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (with admin authorization and audit logging)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // ⚠️ Security Check: Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get target user's role for audit logging
    const targetUserRole = await getUserRole(userId)

    // Log deletion for audit trail
    console.log(`[USER_DELETE] Admin ${user.email} deleting user ${userId} (role: ${targetUserRole})`)

    // Use admin client to delete user (bypasses RLS)
    const adminClient = createAdminClient()

    // Delete user from auth (this will cascade delete from user_profiles and user_roles)
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) throw error

    return NextResponse.json({
      message: 'User deleted successfully',
      audit: {
        deleted_by: user.email,
        deleted_user_role: targetUserRole,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}
