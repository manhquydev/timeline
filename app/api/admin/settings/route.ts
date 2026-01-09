import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { getSettingsModel, type GlobalSettings } from '@/lib/mongodb/models'
import { z } from 'zod'

// Validation schema for settings
const settingsValidationSchema = z.object({
  site: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    maintenanceMode: z.boolean(),
  }),
  upload: z.object({
    maxFileSize: z.number().min(1).max(50),
    allowedTypes: z.array(z.string()),
    autoApprove: z.boolean(),
    compressionQuality: z.number().min(10).max(100),
  }),
  notifications: z.object({
    emailOnNewPost: z.boolean(),
    emailOnNewUser: z.boolean(),
    emailOnPendingReview: z.boolean(),
  }),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectToDatabase()
    const Settings = getSettingsModel()
    const settings = await Settings.findOne({ key: 'global' }).lean() as { value?: any } | null

    return NextResponse.json(settings?.value || null)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = settingsValidationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid settings format', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const Settings = getSettingsModel()

    const updated = await Settings.findOneAndUpdate(
      { key: 'global' },
      {
        key: 'global',
        value: validationResult.data,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true, settings: updated.value })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
