import { createClient } from './server'

/**
 * Get display name for a user with priority: display_name > full_name > email
 */
export async function getUserDisplayName(userId: string | null): Promise<string> {
  if (!userId) return 'Anonymous'

  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, full_name, email')
      .eq('id', userId)
      .single()

    if (!profile) return 'Anonymous'

    return (
      (profile as any).display_name ||
      (profile as any).full_name ||
      (profile as any).email?.split('@')[0] ||
      'Anonymous'
    )
  } catch (error) {
    console.error('Error fetching user display name:', error)
    return 'Anonymous'
  }
}

/**
 * Batch fetch display names for multiple users
 * Returns a map of userId -> displayName
 */
export async function getUserDisplayNames(
  userIds: (string | null)[]
): Promise<Map<string, string>> {
  const displayNameMap = new Map<string, string>()

  // Filter out null/undefined and deduplicate
  const uniqueUserIds = Array.from(new Set(userIds.filter((id): id is string => !!id)))

  if (uniqueUserIds.length === 0) {
    return displayNameMap
  }

  try {
    const supabase = await createClient()
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, full_name, email')
      .in('id', uniqueUserIds)

    if (error) {
      console.error('Error batch fetching user display names:', error)
      return displayNameMap
    }

    if (!profiles) return displayNameMap

    // Build the map with priority logic
    profiles.forEach((profile: any) => {
      const displayName =
        profile.display_name ||
        profile.full_name ||
        profile.email?.split('@')[0] ||
        'Anonymous'

      displayNameMap.set(profile.id, displayName)
    })

    return displayNameMap
  } catch (error) {
    console.error('Error batch fetching user display names:', error)
    return displayNameMap
  }
}

/**
 * Enrich posts with real-time display names
 * This replaces the stored user_name with fresh data from user_profiles
 */
export async function enrichPostsWithDisplayNames<T extends { user_id: string | null; user_name?: string | null }>(
  posts: T[]
): Promise<T[]> {
  // Extract unique user IDs
  const userIds = posts.map((post) => post.user_id)

  // Batch fetch display names
  const displayNameMap = await getUserDisplayNames(userIds)

  // Enrich posts
  return posts.map((post) => ({
    ...post,
    user_name: post.user_id ? displayNameMap.get(post.user_id) || post.user_name || 'Anonymous' : null,
  }))
}
