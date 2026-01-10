import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import { themeRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { adminLogger } from '@/lib/logger'

/**
 * PATCH /api/admin/themes/[id]
 * Update a specific theme
 */
export const PATCH = withAdmin(async (
  request: NextRequest,
  { user }: AdminContext
) => {
  try {
    // Extract id from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]

    if (!id) {
      return errorResponse('Theme ID is required', 400, ErrorCodes.VALIDATION_ERROR)
    }

    const updates = await request.json()

    await connectToDatabase()

    // Remove metadata fields that shouldn't be manually updated via this route
    const { id: _, _id, createdAt, updatedAt, ...cleanUpdates } = updates

    const updatedTheme = await themeRepository.update(id, cleanUpdates)

    if (!updatedTheme) {
      return errorResponse('Theme not found', 404, ErrorCodes.NOT_FOUND)
    }

    return successResponse({ success: true, theme: updatedTheme })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error updating theme')
    return errorResponse(error.message || 'Failed to update theme', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
