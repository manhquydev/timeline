import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { NextRequest } from 'next/server'
import { postRepository } from '@/lib/mongodb/repositories'
import { updateEventStats } from '@/lib/mongodb/utils/stats-updater'
import { successResponse, errorResponse, ErrorCodes, validateBody } from '@/lib/api-utils'
import { postActionSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: body, error: bodyError } = await validateBody(request, postActionSchema)
    if (bodyError) return bodyError

    const { postId, action } = body

    let success = false
    let eventId: string | undefined

    switch (action) {
      case 'approve':
        const approved = await postRepository.approve(postId)
        success = !!approved
        if (approved) eventId = approved.event_id
        break

      case 'reject':
        const rejected = await postRepository.reject(postId)
        success = !!rejected
        if (rejected) eventId = rejected.event_id
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
        console.error('Failed to update event stats:', error)
      }
    }

    return successResponse({
      success: true,
      message: `Post ${action}d successfully`,
    })
  } catch (error: any) {
    console.error('Error managing post:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}
