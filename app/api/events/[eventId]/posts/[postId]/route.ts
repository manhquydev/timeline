import { NextResponse } from 'next/server'

import { likeRepository, postRepository } from '@/lib/mongodb/repositories'
import { createClient } from '@/lib/supabase/server'
import { enrichPostsWithDisplayNames } from '@/lib/supabase/profile-utils'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string; postId: string }> }
) {
  try {
    const { eventId, postId } = await params
    const post = await postRepository.findById(postId)

    if (!post || post.event_id !== eventId || post.status !== 'approved') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const mapped = {
      id: post.id,
      event_id: post.event_id,
      user_id: post.user_id || null,
      media_type: post.media_type,
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url || null,
      blurhash: post.blurhash || null,
      dimensions: {
        width: post.dimensions?.width || null,
        height: post.dimensions?.height || null,
      },
      file_size: post.file_size || null,
      wish_text: post.wish_text || null,
      uploaded_at: post.uploaded_at.toISOString(),
      view_count: post.view_count,
      status: post.status,
      user_name: post.user_name || null,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      current_user_liked: false,
    }

    const [enriched] = await enrichPostsWithDisplayNames([mapped])
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      enriched.current_user_liked = await likeRepository.hasUserLiked(enriched.id, user.id)
    }

    return NextResponse.json({ post: enriched })
  } catch (error) {
    console.error('GET /api/events/[eventId]/posts/[postId] error:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

