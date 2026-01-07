import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { commentRepository, notificationRepository } from '@/lib/mongodb/repositories'
import { postRepository } from '@/lib/mongodb/repositories/PostRepository'
import { NotificationType } from '@/lib/mongodb/models'
import { apiResponse } from '@/lib/api-utils'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    try {
        const comments = await commentRepository.getCommentsByPost(postId, limit, offset)
        const total = await commentRepository.countComments(postId)
        return apiResponse.success({ comments, total })
    } catch (error: any) {
        return apiResponse.serverError(error)
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return apiResponse.unauthorized()
    }

    try {
        const { content, parentCommentId } = await request.json()

        if (!content || content.trim().length === 0) {
            return apiResponse.error('Comment content is required')
        }

        const post = await postRepository.findById(postId)
        if (!post) {
            return apiResponse.notFound('Post not found')
        }

        const comment = await commentRepository.createComment(
            user.id,
            postId,
            content,
            post.event_id,
            parentCommentId
        )

        // Notify post owner
        if (post.user_id && post.user_id !== user.id) {
            await notificationRepository.create({
                userId: post.user_id,
                actorId: user.id,
                type: NotificationType.POST_COMMENT,
                title: 'New Comment',
                message: 'Someone commented on your photo',
                postId: postId,
                commentId: comment._id as string,
                link: `/events/${post.event_id}?postId=${postId}`
            })

            // Broadcast notification event
            const channel = supabase.channel('social-events')
            await channel.send({
                type: 'broadcast',
                event: 'notification:new',
                payload: { recipientId: post.user_id, title: 'New Comment', message: 'Someone commented on your photo', link: `/events/${post.event_id}?postId=${postId}` }
            })
        }

        // Broadcast comment event
        const channel = supabase.channel('social-events')
        await channel.send({
            type: 'broadcast',
            event: 'comment:add',
            payload: { postId, comment }
        })

        return apiResponse.success(comment, 'Comment added')
    } catch (error: any) {
        return apiResponse.serverError(error)
    }
}
