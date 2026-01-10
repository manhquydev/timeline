import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import { encode } from 'blurhash'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'
import { updateEventStats } from '@/lib/mongodb/utils/stats-updater'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { uploadFormDataSchema } from '@/lib/validations'
import { validateUploadedFile } from '@/lib/security/file-validation'
import { uploadLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 401, ErrorCodes.UNAUTHORIZED)
    }

    const formData = await request.formData()
    const eventId = formData.get('eventId') as string
    const wishText = formData.get('wishText') as string
    const files = formData.getAll('files') as File[]

    // Validate form data with Zod
    const validation = uploadFormDataSchema.safeParse({ eventId, wishText, files })
    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(i => i.message).join(', '),
        400,
        ErrorCodes.VALIDATION_ERROR
      )
    }

    // Verify event exists and allows uploads
    const event = await eventRepository.findById(eventId)

    if (!event) {
      return errorResponse('Event not found', 404, ErrorCodes.NOT_FOUND)
    }

    if (event.status !== 'open' || !event.allow_upload) {
      return errorResponse('Event is not accepting uploads', 403, ErrorCodes.FORBIDDEN)
    }

    // Get user profile for name (still from Supabase)
    // Priority: display_name > full_name > email
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('display_name, full_name, email')
      .eq('id', user.id)
      .single<{ display_name: string | null; full_name: string | null; email: string | null }>()

    const userName = userProfile?.display_name ||
      userProfile?.full_name ||
      userProfile?.email?.split('@')[0] ||
      'Anonymous'

    const uploadedPosts: any[] = []

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())

        // Validate file with magic bytes check
        const fileValidation = await validateUploadedFile(file, buffer)
        if (!fileValidation.valid) {
          uploadLogger.warn({ fileName: file.name, error: fileValidation.error }, 'File validation failed')
          continue // Skip invalid files
        }

        const fileId = nanoid()
        const fileExtension = file.name.split('.').pop()
        const fileName = `${fileId}.${fileExtension}`
        const thumbnailName = `${fileId}_thumb.${fileExtension}`

        // Process image with Sharp
        const image = sharp(buffer).rotate()
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
        const mainPath = `${eventId}/${user.id}/${fileName}`
        const { error: uploadError } = await supabase.storage
          .from('event-media')
          .upload(mainPath, optimizedBuffer, {
            contentType: 'image/webp',
            upsert: false,
          })

        if (uploadError) throw uploadError

        // Upload thumbnail
        const thumbPath = `${eventId}/${user.id}/${thumbnailName}`
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

        // Create post record in MongoDB
        let post;
        try {
          post = await postRepository.create({
            event_id: eventId,
            user_id: user.id,
            media_type: 'image',
            media_url: mainUrl.publicUrl,
            thumbnail_url: thumbUrl.publicUrl,
            blurhash,
            dimensions: {
              width: metadata.width || null,
              height: metadata.height || null,
            },
            file_size: optimizedBuffer.length,
            wish_text: wishText || null,
            status: 'approved',
            user_name: userName,
          })
          uploadedPosts.push(post)
        } catch (mongoError) {
          uploadLogger.error({ err: mongoError, fileName }, 'MongoDB creation failed, cleaning up storage')
          // Attempt to cleanup storage files if MongoDB fails
          await supabase.storage.from('event-media').remove([mainPath, thumbPath])
          throw mongoError // Rethrow to be caught by the outer loop's catch block
        }
      } catch (error) {
        uploadLogger.error({ err: error, fileName: file.name }, 'Error processing file')
        // Continue with other files
      }
    }

    if (uploadedPosts.length === 0) {
      return errorResponse('No files were successfully uploaded', 500, ErrorCodes.INTERNAL_ERROR)
    }

    // Update event stats after successful uploads
    try {
      await updateEventStats(eventId)
    } catch (error) {
      uploadLogger.error({ err: error, eventId }, 'Failed to update event stats')
    }

    return successResponse({
      message: 'Upload successful',
      posts: uploadedPosts,
    })
  } catch (error: any) {
    uploadLogger.error({ err: error }, 'Upload error')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}
