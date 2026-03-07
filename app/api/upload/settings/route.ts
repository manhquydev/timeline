import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUploadEngineSettings } from '@/lib/upload-engine-settings'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getUploadEngineSettings()

    return NextResponse.json(
      {
        maxFileSizeMB: settings.maxFileSizeMB,
        allowedTypes: settings.allowedTypes,
        compressionQuality: settings.compressionQuality,
        compressionTargetMB: settings.clientCompressionTargetMB,
        maxWidth: settings.maxWidth,
        maxHeight: settings.maxHeight,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load upload settings' },
      { status: 500 }
    )
  }
}

