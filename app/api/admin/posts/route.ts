import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'
import { postRepository } from '@/lib/mongodb/repositories'
import { updateEventStats } from '@/lib/mongodb/utils/stats-updater'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check admin permission (still using Supabase Auth)
    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { postId, action } = body

    if (!postId || !action) {
      return NextResponse.json(
        { error: 'Missing postId or action' },
        { status: 400 }
      )
    }

    let success = false
    let eventId: string | undefined

    switch (action) {
      case 'approve':
        const approved = await postRepository.approve(postId)
        success = !!approved
        if (approved) {
          eventId = approved.event_id
        }
        break

      case 'reject':
        const rejected = await postRepository.reject(postId)
        success = !!rejected
        if (rejected) {
          eventId = rejected.event_id
        }
        break

      case 'delete':
        // First get the post to delete media from storage
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

        // Delete from MongoDB
        success = await postRepository.delete(postId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
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
        // Don't fail the request if stats update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Post ${action}d successfully`,
    })
  } catch (error: any) {
    console.error('Error managing post:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
