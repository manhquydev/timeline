import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import sharp from 'sharp'
import { nanoid } from 'nanoid'
import { adminLogger } from '@/lib/logger'

/**
 * POST /api/admin/team/upload-avatar
 * Upload avatar for team member (Admin only)
 */
export const POST = withAdmin(async (request: NextRequest, { user, supabase }: AdminContext) => {
  try {
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return errorResponse('No file provided', 400, ErrorCodes.VALIDATION_ERROR)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return errorResponse('File must be an image', 400, ErrorCodes.VALIDATION_ERROR)
    }

    // Process image with Sharp
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileId = nanoid()

    // Resize and optimize avatar (square, 400x400)
    const optimizedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 90 })
      .toBuffer()

    // Upload to Supabase Storage (team-avatars bucket)
    const fileName = `${fileId}.webp`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-media') // Reuse existing bucket
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false,
      })

    if (uploadError) {
      adminLogger.error({ err: uploadError }, 'Avatar upload error')
      return errorResponse(uploadError.message || 'Failed to upload avatar', 500, ErrorCodes.INTERNAL_ERROR)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('event-media')
      .getPublicUrl(filePath)

    return successResponse({
      success: true,
      avatar_url: urlData.publicUrl,
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error uploading avatar')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
