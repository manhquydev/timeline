import { NextRequest, NextResponse } from 'next/server'
import { postRepository } from '@/lib/mongodb/repositories'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    userId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch user profile from Supabase
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    // Fetch approved posts from MongoDB
    const mongoPosts = await postRepository.findByUser(userId)

    // Filter only approved posts
    const approvedPosts = mongoPosts.filter(p => p.status === 'approved')

    // Convert to plain objects
    const posts = approvedPosts.map(p => ({
      id: p.id,
      event_id: p.event_id,
      user_id: p.user_id,
      media_type: p.media_type,
      media_url: p.media_url,
      thumbnail_url: p.thumbnail_url,
      blurhash: p.blurhash,
      dimensions: p.dimensions,
      file_size: p.file_size,
      wish_text: p.wish_text,
      uploaded_at: p.uploaded_at.toISOString(),
      view_count: p.view_count,
      status: p.status,
      user_name: p.user_name,
    }))

    const displayName = (profile as any)?.display_name || 'Người dùng'
    const avatarUrl = (profile as any)?.avatar_url || null

    return NextResponse.json({
      user: {
        id: userId,
        display_name: displayName,
        avatar_url: avatarUrl,
      },
      posts,
      total: posts.length,
    })
  } catch (error) {
    console.error('Error fetching wall data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wall data' },
      { status: 500 }
    )
  }
}
