import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { encode } from 'blurhash'
import { postRepository } from '@/lib/mongodb/repositories'
import { nanoid } from 'nanoid'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const supabase = await createClient()
        const { postId } = await params

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Verify post ownership
        const post = await postRepository.findById(postId)

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        if (post.user_id !== user.id) {
            // TODO: Allow admins/mods to edit?
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Process new image
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileId = nanoid()
        const fileExtension = 'webp' // We'll convert to webp
        const fileName = `${fileId}.${fileExtension}`
        const thumbnailName = `${fileId}_thumb.${fileExtension}`

        const image = sharp(buffer).rotate() // Ensure EXIF rotation is applied
        const metadata = await image.metadata()

        // Compress and optimize main image
        const optimizedBuffer = await image
            .resize(2048, 2048, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: 85 })
            .toBuffer()

        // Generate thumbnail
        const thumbnailBuffer = await sharp(buffer)
            .resize(400, 400, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: 75 })
            .toBuffer()

        // Generate blurhash
        const blurhashBuffer = await sharp(buffer)
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

        // Upload main image to Supabase Storage
        const mainPath = `${post.event_id}/${user.id}/${fileName}`
        const { error: uploadError } = await supabase.storage
            .from('event-media')
            .upload(mainPath, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) throw uploadError

        // Upload thumbnail
        const thumbPath = `${post.event_id}/${user.id}/${thumbnailName}`
        await supabase.storage
            .from('event-media')
            .upload(thumbPath, thumbnailBuffer, {
                contentType: 'image/webp',
                upsert: false,
            })

        // Get public URLs
        const { data: mainUrl } = supabase.storage
            .from('event-media')
            .getPublicUrl(mainPath)

        const { data: thumbUrl } = supabase.storage
            .from('event-media')
            .getPublicUrl(thumbPath)

        // Update MongoDB record
        // We optionally keep old image file in storage for history, or we could delete it.
        // Ideally we should delete old files to save space, but let's keep it simple for now.

        const updatedPost = await postRepository.update(postId, {
            media_url: mainUrl.publicUrl,
            thumbnail_url: thumbUrl.publicUrl,
            blurhash,
            dimensions: {
                width: metadata.width || null,
                height: metadata.height || null,
            },
            file_size: optimizedBuffer.length,
            // Status remains 'approved' or should it act like a new upload? 
            // Assuming 'approved' if user is editing their own approved post.
        })

        return NextResponse.json({
            message: 'Post updated successfully',
            post: updatedPost
        })

    } catch (error: any) {
        console.error('Update post error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
