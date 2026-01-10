import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import { connectToDatabase } from '@/lib/mongodb/connection'
import Theme from '@/lib/mongodb/models/Theme'
import { adminLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/themes/fix
 * Fix database inconsistencies (multiple active themes)
 * Admin only
 */
export const POST = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    adminLogger.info({ userId: user.id }, 'Starting database fix')

    await connectToDatabase()

    // Find all active themes
    const activeThemes = await Theme.find({ isActive: true })
    adminLogger.info({ count: activeThemes.length }, 'Found active themes')

    if (activeThemes.length <= 1) {
      return successResponse({
        success: true,
        message: 'Database is already consistent',
        activeThemes: activeThemes.length
      })
    }

    // Multiple active themes found - fix it
    adminLogger.warn({ count: activeThemes.length }, 'Multiple active themes detected, fixing')

    // Deactivate all themes first
    await Theme.updateMany(
      {},
      { $set: { isActive: false } }
    )
    adminLogger.info('All themes deactivated')

    // Activate only the 'default' theme (or first one if default doesn't exist)
    const defaultTheme = await Theme.findOne({ name: 'default' })
    if (defaultTheme) {
      await Theme.findOneAndUpdate(
        { id: defaultTheme.id },
        { $set: { isActive: true } }
      )
      adminLogger.info({ themeId: defaultTheme.id }, 'Activated default theme')

      return successResponse({
        success: true,
        message: 'Database fixed! Default theme is now active.',
        fixed: true,
        activeTheme: {
          id: defaultTheme.id,
          name: defaultTheme.name,
          displayName: defaultTheme.displayName
        }
      })
    } else {
      // No default theme, activate the first theme
      const firstTheme = await Theme.findOne()
      if (firstTheme) {
        await Theme.findOneAndUpdate(
          { id: firstTheme.id },
          { $set: { isActive: true } }
        )
        adminLogger.info({ themeName: firstTheme.name, themeId: firstTheme.id }, 'Activated first theme')

        return successResponse({
          success: true,
          message: `Database fixed! Theme "${firstTheme.displayName}" is now active.`,
          fixed: true,
          activeTheme: {
            id: firstTheme.id,
            name: firstTheme.name,
            displayName: firstTheme.displayName
          }
        })
      } else {
        return successResponse({
          success: false,
          message: 'No themes found in database',
          fixed: false
        })
      }
    }
  } catch (error) {
    adminLogger.error({ err: error }, 'Error fixing themes')
    return errorResponse(
      'Failed to fix themes',
      500,
      ErrorCodes.INTERNAL_ERROR
    )
  }
})
