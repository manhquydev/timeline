import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, validateBody, type AdminContext } from '@/lib/api-utils'
import { postRepository } from '@/lib/mongodb/repositories'
import { updateEventStats } from '@/lib/mongodb/utils/stats-updater'
import { postActionSchema } from '@/lib/validations'
import { logPostModeration, logPostDeletion } from '@/lib/services/audit-service'
import { adminLogger } from '@/lib/logger'

/**
 * POST /api/admin/posts
 * Manage posts (approve, reject, delete)
 */
export const POST = withAdmin(async (request: NextRequest, { user, supabase }: AdminContext) => {
  try {
    const { data: body, error: bodyError } = await validateBody(request, postActionSchema)
    if (bodyError) return bodyError

    const { postId, action } = body

    let success = false
    let eventId: string | undefined

    switch (action) {
      case 'approve':
        const approved = await postRepository.approve(postId)
        success = !!approved
        if (approved) {
          eventId = approved.event_id
          await logPostModeration(request, { id: user.id, email: user.email! }, postId, 'pending', 'approved')
        }
        break

      case 'reject':
        const rejected = await postRepository.reject(postId)
        success = !!rejected
        if (rejected) {
          eventId = rejected.event_id
          await logPostModeration(request, { id: user.id, email: user.email! }, postId, 'pending', 'rejected')
        }
        break

      case 'delete':
        const post = await postRepository.findById(postId)

        if (post) {
          eventId = post.event_id

          // Delete from Supabase storage
          const mediaPath = post.media_url.split('/').slice(-3).join('/')
          if (mediaPath) {
            await supabase.storage.from('event-media').remove([mediaPath])
          }

          if (post.thumbnail_url) {
            const thumbPath = post.thumbnail_url.split('/').slice(-3).join('/')
            if (thumbPath) {
              await supabase.storage.from('event-media').remove([thumbPath])
            }
          }

          await logPostDeletion(request, { id: user.id, email: user.email! }, postId, post.status)
        }

        success = await postRepository.delete(postId)
        break

      default:
        return errorResponse('Invalid action', 400, ErrorCodes.VALIDATION_ERROR)
    }

    if (!success) {
      throw new Error('Failed to perform action')
    }

    // Update event stats after any post status change
    if (eventId) {
      try {
        await updateEventStats(eventId)
      } catch (error) {
        adminLogger.error({ err: error, eventId }, 'Failed to update event stats')
      }
    }

    return successResponse({
      success: true,
      message: `Post ${action}d successfully`,
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error managing post')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
