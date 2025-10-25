import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { eventRepository } from '@/lib/mongodb/repositories'
import { UPLOAD_LIMITS } from '@/lib/upload-config'

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

    const { eventId, fileCount } = await request.json()

    // Validate input
    if (!eventId || !fileCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file count
    if (fileCount > UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD) {
      return NextResponse.json(
        {
          error: `Tối đa ${UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} ảnh mỗi lần tải lên`,
          code: 'TOO_MANY_FILES',
        },
        { status: 400 }
      )
    }

    // Verify event exists and allows uploads
    const event = await eventRepository.findById(eventId)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'open' || !event.allow_upload) {
      return NextResponse.json(
        { error: 'Event is not accepting uploads' },
        { status: 403 }
      )
    }

    // Generate presigned upload URLs
    const uploadUrls: Array<{
      uploadUrl: string
      fileId: string
      path: string
      token: string
    }> = []

    for (let i = 0; i < fileCount; i++) {
      const fileId = nanoid()
      const path = `${eventId}/${user.id}/${fileId}.webp`

      // Create signed upload URL (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from('event-media')
        .createSignedUploadUrl(path)

      if (error) {
        console.error(`Error creating signed URL for file ${i}:`, error)
        throw new Error(`Failed to generate upload URL: ${error.message}`)
      }

      uploadUrls.push({
        uploadUrl: data.signedUrl,
        fileId,
        path,
        token: data.token,
      })
    }

    console.log(`✅ Generated ${uploadUrls.length} presigned URLs for user ${user.id}`)

    return NextResponse.json(
      {
        uploadUrls,
        eventId,
        userId: user.id,
        expiresIn: 3600, // 1 hour
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload URLs' },
      { status: 500 }
    )
  }
}
