import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import { eventRepository } from '@/lib/mongodb/repositories'
import { adminLogger } from '@/lib/logger'

/**
 * POST /api/admin/cleanup
 * Clean up orphaned posts (posts referencing deleted events)
 * Admin only
 */
export const POST = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    // Get all event IDs
    const events = await eventRepository.findAll()
    const validEventIds = new Set(events.map(e => e.id))

    // Get all posts
    const Post = (await import('@/lib/mongodb/models')).Post
    const allPosts = await Post.find().lean()

    // Find orphaned posts
    const orphanedPosts = allPosts.filter((post: any) => !validEventIds.has(post.event_id))

    if (orphanedPosts.length === 0) {
      return successResponse({
        success: true,
        message: 'No orphaned posts found',
        deletedCount: 0,
      })
    }

    // Delete orphaned posts
    const orphanedIds = orphanedPosts.map((post: any) => post.id)
    const result = await Post.deleteMany({ id: { $in: orphanedIds } })

    adminLogger.info({ userId: user.id, deletedCount: result.deletedCount }, 'Cleanup: Deleted orphaned posts')

    return successResponse({
      success: true,
      message: `Deleted ${result.deletedCount} orphaned posts`,
      deletedCount: result.deletedCount,
      orphanedPostIds: orphanedIds,
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error cleaning up orphaned posts')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
