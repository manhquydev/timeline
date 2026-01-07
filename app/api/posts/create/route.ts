import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { postRepository } from '@/lib/mongodb/repositories'
import { updateEventStats } from '@/lib/mongodb/utils/stats-updater'
import sharp from 'sharp'
import { encode } from 'blurhash'

interface PostData {
  fileId: string
  path: string
  dimensions?: { width: number; height: number }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, posts, wishText } = await request.json()

    if (!eventId || !posts || posts.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user profile for display name
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('display_name, full_name, email')
      .eq('id', user.id)
      .single<{ display_name: string | null; full_name: string | null; email: string | null }>()

    const userName =
      userProfile?.display_name ||
      userProfile?.full_name ||
      userProfile?.email?.split('@')[0] ||
      'Anonymous'

    const createdPosts: any[] = []

    // Process each uploaded file
    for (const post of posts as PostData[]) {
      try {
        const { path, dimensions } = post

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('event-media')
          .getPublicUrl(path)

        if (!publicUrlData.publicUrl) {
          throw new Error('Failed to get public URL')
        }

        const mediaUrl = publicUrlData.publicUrl

        // Download image to generate thumbnail and blurhash
        const imageResponse = await fetch(mediaUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to download uploaded image')
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

        // Get metadata
        const image = sharp(imageBuffer)
        const metadata = await image.metadata()

        // Generate thumbnail
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(400, 400, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 75 })
          .toBuffer()

        // Upload thumbnail
        const thumbnailPath = path.replace('.webp', '_thumb.webp')
        const { error: thumbError } = await supabase.storage
          .from('event-media')
          .upload(thumbnailPath, thumbnailBuffer, {
            contentType: 'image/webp',
            upsert: false,
          })

        if (thumbError) {
          console.warn('Failed to upload thumbnail:', thumbError)
        }

        // Get thumbnail URL
        const { data: thumbUrlData } = supabase.storage
          .from('event-media')
          .getPublicUrl(thumbnailPath)

        // Generate blurhash
        const blurhashBuffer = await sharp(imageBuffer)
          .resize(32, 32, { fit: 'inside' })
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true })

        const blurhash = encode(
          new Uint8ClampedArray(blurhashBuffer.data),
          blurhashBuffer.info.width,
          blurhashBuffer.info.height,
          4,
          4
        )

        // Create post record in MongoDB
        const createdPost = await postRepository.create({
          event_id: eventId,
          user_id: user.id,
          media_type: 'image',
          media_url: mediaUrl,
          thumbnail_url: thumbUrlData.publicUrl,
          blurhash,
          dimensions: {
            width: dimensions?.width || metadata.width || null,
            height: dimensions?.height || metadata.height || null,
          },
          file_size: imageBuffer.length,
          wish_text: wishText || null,
          status: 'approved',
          user_name: userName,
        })

        createdPosts.push(createdPost)
      } catch (error) {
        console.error(`Error processing post ${post.fileId}:`, error)
        // Continue with other posts even if one fails
      }
    }

    if (createdPosts.length === 0) {
      return NextResponse.json(
        { error: 'No posts were successfully created' },
        { status: 500 }
      )
    }

    // Update event stats
    try {
      await updateEventStats(eventId)
    } catch (error) {
      console.error('Failed to update event stats:', error)
      // Don't fail the request if stats update fails
    }

    console.log(`✅ Created ${createdPosts.length} posts for event ${eventId}`)

    // Broadcast new posts via Supabase Realtime
    try {
      const channel = supabase.channel(`event-${eventId}`)
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          type: 'new_posts',
          payload: {
            posts: createdPosts.map(p => ({
              id: p.id,
              media_url: p.media_url,
              thumbnail_url: p.thumbnail_url,
              user_name: p.user_name,
              created_at: p.created_at,
              media_type: p.media_type,
            })),
          },
        },
      })
    } catch (broadcastError) {
      console.error('Failed to broadcast new posts:', broadcastError)
      // Non-critical error, do not fail the request
    }

    return NextResponse.json(
      {
        message: 'Posts created successfully',
        posts: createdPosts,
        successCount: createdPosts.length,
        totalCount: posts.length,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create posts' },
      { status: 500 }
    )
  }
}
