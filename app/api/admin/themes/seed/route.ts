import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import { themeRepository } from '@/lib/mongodb/repositories'
import { PREDEFINED_THEMES } from '@/lib/themes/predefined-themes'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { adminLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/themes/seed
 * Seed predefined themes into database (Admin only)
 */
export const POST = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    adminLogger.info({ userId: user.id }, 'Starting theme seeding process')

    await connectToDatabase()

    const results = []

    for (const themeData of PREDEFINED_THEMES) {
      adminLogger.debug({ themeName: themeData.name }, 'Processing theme')

      // Check if theme already exists
      const existing = await themeRepository.findOne({ name: themeData.name })

      if (existing) {
        adminLogger.debug({ themeName: themeData.name }, 'Theme already exists, skipping')
        results.push({
          name: themeData.name,
          status: 'skipped',
          message: 'Theme already exists'
        })
        continue
      }

      // Create the theme
      const theme = await themeRepository.create({
        name: themeData.name,
        displayName: themeData.displayName,
        description: themeData.description,
        colors: themeData.colors,
        gradients: themeData.gradients,
        effects: themeData.effects,
        coverImage: themeData.coverImage,
        icon: themeData.icon,
        typography: themeData.typography,
        createdBy: user.id,
        isActive: themeData.name === 'default', // Set default theme as active
      })

      adminLogger.info({ themeName: theme.name, themeId: theme.id }, 'Created theme')
      results.push({
        name: theme.name,
        status: 'created',
        id: theme.id
      })
    }

    const createdCount = results.filter(r => r.status === 'created').length
    adminLogger.info({ createdCount, skippedCount: results.length - createdCount }, 'Seeding complete')

    return successResponse({
      success: true,
      results,
      message: `Đã tạo ${createdCount} themes, bỏ qua ${results.length - createdCount} themes đã tồn tại`,
      details: results
    })
  } catch (error) {
    adminLogger.error({ err: error }, 'Error seeding themes')
    return errorResponse(
      'Failed to seed themes',
      500,
      ErrorCodes.INTERNAL_ERROR
    )
  }
})
