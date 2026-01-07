import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { likeRepository, notificationRepository, postRepository } from '@/lib/mongodb/repositories'
import { NotificationType } from '@/lib/mongodb/models'
import { apiResponse } from '@/lib/api-utils'

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
        // Check if post exists
        const post = await postRepository.findById(postId)
        if (!post) {
            return apiResponse.notFound('Post not found')
        }

        // Check if already liked
        const hasLiked = await likeRepository.hasUserLiked(user.id, postId)

        if (hasLiked) {
            // Unlike
            await likeRepository.removeLike(user.id, postId)

            // Broadcast unlike event via Supabase Realtime
            const channel = supabase.channel(`event-${post.event_id}`)
            await channel.send({
                type: 'broadcast',
                event: 'message',
                payload: {
                    type: 'post:unlike',
                    payload: {
                        postId,
                        userId: user.id
                    }
                }
            })

            return apiResponse.success({ liked: false }, 'Unliked')
        } else {
            // Like
            const like = await likeRepository.addLike(user.id, postId, post.event_id)

            // Create notification if post owner is not the liker
            if (post.user_id && post.user_id !== user.id) {
                await notificationRepository.create({
                    userId: post.user_id,
                    actorId: user.id,
                    type: NotificationType.POST_LIKE,
                    title: 'New Like',
                    message: `${user.user_metadata?.full_name || 'Ai đó'} đã thích ảnh của bạn`,
                    postId: postId,
                    link: `/events/${post.event_id}?postId=${postId}`
                })

                // Broadcast notification event
                const notifChannel = supabase.channel('social-events')
                await notifChannel.send({
                    type: 'broadcast',
                    event: 'notification:new',
                    payload: { recipientId: post.user_id, title: 'New Like', message: `${user.user_metadata?.full_name || 'Ai đó'} đã thích ảnh của bạn`, link: `/events/${post.event_id}?postId=${postId}` }
                })
            }

            // Broadcast like event
            const channel = supabase.channel(`event-${post.event_id}`)
            await channel.send({
                type: 'broadcast',
                event: 'message',
                payload: {
                    type: 'post:like',
                    payload: {
                        postId,
                        userId: user.id,
                        user_name: user.user_metadata?.full_name || 'Ai đó',
                        avatar_url: user.user_metadata?.avatar_url
                    }
                }
            })

            return apiResponse.success({ liked: true }, 'Liked')
        }
    } catch (error: any) {
        return apiResponse.serverError(error)
    }
}

export async function GET(
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

    const { data: { user } } = await supabase.auth.getUser()

    try {
        const count = await likeRepository.getLikeCount(postId)
        let hasLiked = false

        if (user) {
            hasLiked = await likeRepository.hasUserLiked(user.id, postId)
        }

        return apiResponse.success({ count, hasLiked })
    } catch (error: any) {
        return apiResponse.serverError(error)
    }
}
