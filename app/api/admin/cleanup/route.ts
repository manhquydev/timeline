import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'

/**
 * POST /api/admin/cleanup
 * Clean up orphaned posts (posts referencing deleted events)
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Get all event IDs
    const events = await eventRepository.findAll()
    const validEventIds = new Set(events.map(e => e.id))

    // Get all posts
    const Post = (await import('@/lib/mongodb/models')).Post
    const allPosts = await Post.find().lean()

    // Find orphaned posts
    const orphanedPosts = allPosts.filter((post: any) => !validEventIds.has(post.event_id))

    if (orphanedPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned posts found',
        deletedCount: 0,
      })
    }

    // Delete orphaned posts
    const orphanedIds = orphanedPosts.map((post: any) => post.id)
    const result = await Post.deleteMany({ id: { $in: orphanedIds } })

    console.log(`Cleanup: Deleted ${result.deletedCount} orphaned posts`)

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} orphaned posts`,
      deletedCount: result.deletedCount,
      orphanedPostIds: orphanedIds,
    })
  } catch (error: any) {
    console.error('Error cleaning up orphaned posts:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
