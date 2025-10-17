import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'

export interface UserRoleData {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

/**
 * Get user's role from database
 * Returns 'user' as default if no role found
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single<{ role: UserRole }>()

    if (error || !data) {
      return 'user' // Default role
    }

    return data.role
  } catch (error) {
    console.error('Error fetching user role:', error)
    return 'user'
  }
}

/**
 * Check if user has admin privileges (admin or super_admin)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin' || role === 'super_admin'
}

/**
 * Check if user has moderator privileges or higher
 */
export async function isModerator(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'moderator' || role === 'admin' || role === 'super_admin'
}

/**
 * Check if user has super admin privileges
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'super_admin'
}

/**
 * Check if user has specific role
 */
export async function hasRole(userId: string, requiredRole: UserRole): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === requiredRole
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
  const role = await getUserRole(userId)
  return roles.includes(role)
}

/**
 * Get current user's role (for server components)
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    return await getUserRole(user.id)
  } catch (error) {
    console.error('Error getting current user role:', error)
    return null
  }
}

/**
 * Check if current user is admin (for server components)
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    return await isAdmin(user.id)
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get all users with their roles (admin only)
 */
export async function getAllUsersWithRoles() {
  try {
    const supabase = await createClient()

    // Check if current user is admin
    const isAdminUser = await isCurrentUserAdmin()
    if (!isAdminUser) {
      throw new Error('Unauthorized: Admin access required')
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        user:auth.users(id, email, created_at)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching users with roles:', error)
    return []
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if current user is admin
    const isAdminUser = await isCurrentUserAdmin()
    if (!isAdminUser) {
      return { success: false, error: 'Unauthorized: Admin access required' }
    }

    const updateData: Database['public']['Tables']['user_roles']['Update'] = {
      role: newRole
    }

    // Type assertion needed due to Supabase type inference limitation
    const { error} = await (supabase as any)
      .from('user_roles')
      .update(updateData)
      .eq('user_id', userId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error updating user role:', error)
    return { success: false, error: error.message }
  }
}
