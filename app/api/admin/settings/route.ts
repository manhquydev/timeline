import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { getSettingsModel } from '@/lib/mongodb/models'
import { adminLogger } from '@/lib/logger'
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

export const GET = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    await connectToDatabase()
    const Settings = getSettingsModel()
    const settings = await Settings.findOne({ key: 'global' }).lean() as { value?: any } | null

    return successResponse(settings?.value || null)
  } catch (error) {
    adminLogger.error({ err: error }, 'Error fetching settings')
    return errorResponse('Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

export const PATCH = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = settingsValidationSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(
        'Invalid settings format',
        400,
        ErrorCodes.VALIDATION_ERROR
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

    adminLogger.info({ userId: user.id }, 'Settings updated')
    return successResponse({ success: true, settings: updated.value })
  } catch (error) {
    adminLogger.error({ err: error }, 'Error updating settings')
    return errorResponse('Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
