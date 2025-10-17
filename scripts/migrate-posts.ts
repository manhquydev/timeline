import { createClient } from '@/lib/supabase/server'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { postRepository, eventRepository } from '@/lib/mongodb/repositories'
import type { Database } from '@/lib/supabase/database.types'

type SupabasePost = Database['public']['Tables']['posts']['Row']

/**
 * Migrate posts from Supabase to MongoDB
 * This script can be run multiple times safely (idempotent)
 */
export async function migratePosts() {
  console.log('🚀 Starting posts migration from Supabase to MongoDB...')

  try {
    // Connect to both databases
    await connectToDatabase()
    const supabase = await createClient()

    // Fetch all posts from Supabase with user profiles
    const { data: supabasePosts, error } = await supabase
      .from('posts')
      .select(`
        *,
        user_profiles (
          full_name
        )
      `)
      .order('uploaded_at', { ascending: true })
      .returns<(SupabasePost & { user_profiles?: { full_name: string | null } | null })[]>()

    if (error) {
      throw new Error(`Failed to fetch posts from Supabase: ${error.message}`)
    }

    if (!supabasePosts || supabasePosts.length === 0) {
      console.log('⚠️  No posts found in Supabase')
      return { success: true, migrated: 0, skipped: 0, errors: [] }
    }

    console.log(`📊 Found ${supabasePosts.length} posts in Supabase`)

    let migrated = 0
    let skipped = 0
    const errors: Array<{ id: string; error: string }> = []

    // Track contributors per event for stats update
    const eventContributors = new Map<string, Set<string>>()

    // Migrate each post
    for (const supabasePost of supabasePosts) {
      try {
        // Check if post already exists in MongoDB
        const existingPost = await postRepository.findById(supabasePost.id)

        if (existingPost) {
          console.log(`⏭️  Post ${supabasePost.id} already exists, skipping...`)
          skipped++
          continue
        }

        // Get user name from joined data
        const userName = (supabasePost as any).user_profiles?.full_name || null

        // Transform Supabase post to MongoDB format
        const mongoPost = {
          id: supabasePost.id,
          event_id: supabasePost.event_id,
          user_id: supabasePost.user_id,
          media_type: supabasePost.media_type as 'image' | 'video',
          media_url: supabasePost.media_url,
          thumbnail_url: supabasePost.thumbnail_url,
          blurhash: supabasePost.blurhash,
          dimensions: {
            width: supabasePost.width,
            height: supabasePost.height,
          },
          file_size: supabasePost.file_size,
          wish_text: supabasePost.wish_text,
          uploaded_at: new Date(supabasePost.uploaded_at),
          view_count: supabasePost.view_count,
          status: supabasePost.status as 'pending' | 'approved' | 'rejected',
          user_name: userName,
        }

        // Create post in MongoDB
        await postRepository.create(mongoPost)

        // Track contributor for this event
        if (supabasePost.user_id) {
          if (!eventContributors.has(supabasePost.event_id)) {
            eventContributors.set(supabasePost.event_id, new Set())
          }
          eventContributors.get(supabasePost.event_id)!.add(supabasePost.user_id)
        }

        migrated++

        if (migrated % 100 === 0) {
          console.log(`   ... migrated ${migrated} posts`)
        }
      } catch (err: any) {
        console.error(`❌ Error migrating post ${supabasePost.id}:`, err.message)
        errors.push({ id: supabasePost.id, error: err.message })
      }
    }

    console.log('\n📊 Updating event statistics...')

    // Update event stats based on migrated posts
    let statsUpdated = 0
    for (const [eventId, contributors] of eventContributors.entries()) {
      try {
        const stats = await postRepository.getEventStats(eventId)
        await eventRepository.updateStats(eventId, {
          total_photos: stats.total_photos,
          total_videos: stats.total_videos,
          total_contributors: contributors.size,
        })
        statsUpdated++
      } catch (err: any) {
        console.error(`❌ Error updating stats for event ${eventId}:`, err.message)
      }
    }

    console.log('\n📈 Migration Summary:')
    console.log(`   ✅ Migrated posts: ${migrated}`)
    console.log(`   ⏭️  Skipped posts: ${skipped}`)
    console.log(`   📊 Updated event stats: ${statsUpdated}`)
    console.log(`   ❌ Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Failed migrations (first 10):')
      errors.slice(0, 10).forEach(({ id, error }) => {
        console.log(`   - ${id}: ${error}`)
      })
    }

    return {
      success: errors.length === 0,
      migrated,
      skipped,
      errors,
      statsUpdated,
    }
  } catch (error: any) {
    console.error('💥 Migration failed:', error.message)
    throw error
  }
}

/**
 * Rollback: Delete all migrated posts from MongoDB
 * USE WITH CAUTION!
 */
export async function rollbackPostsMigration() {
  console.log('⚠️  Rolling back posts migration...')

  try {
    await connectToDatabase()
    const Post = (await import('@/lib/mongodb/models')).Post

    const result = await Post.deleteMany({})
    console.log(`✅ Deleted ${result.deletedCount} posts from MongoDB`)

    return { success: true, deleted: result.deletedCount }
  } catch (error: any) {
    console.error('💥 Rollback failed:', error.message)
    throw error
  }
}
