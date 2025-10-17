import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
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

    // Fetch all user profiles with roles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles (
          role,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    // Get user IDs to fetch auth data
    const userIds = profiles?.map((p: any) => p.id) || []

    // Fetch auth users data (email, last_sign_in, etc.)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) throw authError

    // Create a map for quick lookup
    const authUsersMap = new Map(authUsers.map(u => [u.id, u]))

    // Combine profile data with auth data
    const usersWithDetails = profiles?.map((profile: any) => {
      const authUser = authUsersMap.get(profile.id)
      const userRole = profile.user_roles as any

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

// PATCH - Update user role
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

    // Update user role
    const { data, error } = await (supabase
      .from('user_roles') as any)
      .upsert({
        user_id: userId,
        role: role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'User role updated successfully',
      data,
    })
  } catch (error: any) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (soft delete by removing from user_profiles)
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

    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user from auth (this will cascade delete from user_profiles and user_roles)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) throw error

    return NextResponse.json({
      message: 'User deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}
