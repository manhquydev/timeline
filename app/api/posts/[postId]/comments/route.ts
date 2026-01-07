import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { commentRepository, notificationRepository, postRepository } from '@/lib/mongodb/repositories'
import { NotificationType } from '@/lib/mongodb/models'

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
        return NextResponse.json({ comments, total })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
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
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { content, parentCommentId } = await request.json()

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const post = await postRepository.findById(postId)
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
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
                payload: { recipientId: post.user_id }
            })
        }

        // If reply, notify parent comment owner (logic to fetch parent comment author simplified here)
        // TODO: Add logic to notify parent comment author

        // Broadcast comment event
        const channel = supabase.channel('social-events')
        await channel.send({
            type: 'broadcast',
            event: 'comment:add',
            payload: { postId, comment }
        })

        return NextResponse.json({ comment })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
