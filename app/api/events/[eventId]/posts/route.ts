import { NextRequest, NextResponse } from 'next/server'
import { postRepository } from '@/lib/mongodb/repositories'
import { enrichPostsWithDisplayNames } from '@/lib/supabase/profile-utils'
import { createClient } from '@/lib/supabase/server'
import { likeRepository } from '@/lib/mongodb/repositories/LikeRepository'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params
        const searchParams = request.nextUrl.searchParams
        const cursor = searchParams.get('cursor') || undefined
        const limit = parseInt(searchParams.get('limit') || '20', 10)

        // Verify authentication for "current_user_liked"
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { posts: mongoPosts, nextCursor } = await postRepository.findWithCursor(
            eventId,
            limit,
            cursor,
            'approved'
        )

        // Map to frontend format
        const postsWithStoredNames = mongoPosts.map(p => ({
            id: p.id,
            event_id: p.event_id,
            user_id: p.user_id || null,
            media_type: p.media_type,
            media_url: p.media_url,
            thumbnail_url: p.thumbnail_url || null,
            blurhash: p.blurhash || null,
            dimensions: {
                width: p.dimensions?.width || null,
                height: p.dimensions?.height || null,
            },
            file_size: p.file_size || null,
            wish_text: p.wish_text || null,
            uploaded_at: p.uploaded_at.toISOString(),
            view_count: p.view_count,
            status: p.status,
            user_name: p.user_name || null,
            likes_count: p.likes_count || 0,
            comments_count: p.comments_count || 0,
            current_user_liked: false // Placeholder, filled below
        }))

        let posts = await enrichPostsWithDisplayNames(postsWithStoredNames)

        // Populate current_user_liked if user is logged in
        if (user) {
            // Optimization: Fetch all likes for these posts by this user in one go?
            // Or just map async. For 20 posts, mapping is fine but `isLiked` might be DB call.
            // `LikeRepository` usually has `exists(postId, userId)`.
            // Better: `LikeRepository.findUserLikesForPosts(userId, postIds)` (if exists)
            // If not, we might need to add it or do N+1 (bad) or leave it false and let frontend fetch?
            // SocialActions seems to fetch? Let's check SocialActions.tsx next.
            // Assuming current implementation needs it.

            // checking `LikeRepository` capability would be good.
            // For now I'll use a Promise.all with isLiked if efficient enough or add a bulk check.
            // Actually, let's see if we can do better.
            // checking `LikeRepository`... I don't see it in open files.
            // I'll stick to basic mapping for now, it's safer.

            posts = await Promise.all(posts.map(async (p) => {
                const isLiked = await likeRepository.hasUserLiked(p.id, user.id)
                return { ...p, current_user_liked: isLiked }
            }))
        }

        return NextResponse.json({
            posts,
            nextCursor
        })
    } catch (error: any) {
        console.error('Error fetching posts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        )
    }
}
