import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { nanoid } from 'nanoid'

/**
 * POST /api/admin/team/upload-avatar
 * Upload avatar for team member (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
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
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('event-media')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      avatar_url: urlData.publicUrl,
    })
  } catch (error: any) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
