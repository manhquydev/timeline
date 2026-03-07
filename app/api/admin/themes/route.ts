import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { withAdmin, successResponse, errorResponse, ErrorCodes, validateBody, validateQuery, type AdminContext } from '@/lib/api-utils'
import { themeRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { createThemeSchema, updateThemeSchemaBody, idQuerySchema } from '@/lib/validations'
import { adminLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/themes
 * List all themes (Admin only)
 */
export const GET = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    await connectToDatabase()

    const themes = await themeRepository.find({})

    const themesData = themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      displayName: theme.displayName,
      description: theme.description,
      colors: theme.colors,
      gradients: theme.gradients,
      effects: theme.effects,
      coverImage: theme.coverImage,
      icon: theme.icon,
      isActive: theme.isActive,
      createdAt: theme.createdAt ? new Date(theme.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: theme.updatedAt ? new Date(theme.updatedAt).toISOString() : new Date().toISOString(),
      createdBy: theme.createdBy,
    }))

    return successResponse({ themes: themesData })
  } catch (error) {
    adminLogger.error({ err: error }, 'Error fetching themes')
    return errorResponse('Failed to fetch themes', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * POST /api/admin/themes
 * Create a new theme (Admin only)
 */
export const POST = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { data: body, error: bodyError } = await validateBody(request, createThemeSchema)
    if (bodyError) return bodyError

    await connectToDatabase()

    const theme = await themeRepository.create({
      ...body,
      createdBy: user.id,
      isActive: false,
    } as unknown as Parameters<typeof themeRepository.create>[0])

    return successResponse({
      theme: {
        id: theme.id,
        name: theme.name,
        displayName: theme.displayName,
        description: theme.description,
        colors: theme.colors,
        gradients: theme.gradients,
        effects: theme.effects,
        coverImage: theme.coverImage,
        icon: theme.icon,
        isActive: theme.isActive,
        createdAt: theme.createdAt ? new Date(theme.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: theme.updatedAt ? new Date(theme.updatedAt).toISOString() : new Date().toISOString(),
        createdBy: theme.createdBy,
      }
    })
  } catch (error) {
    adminLogger.error({ err: error }, 'Error creating theme')
    return errorResponse('Failed to create theme', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * PATCH /api/admin/themes
 * Update or activate a theme (Admin only)
 */
export const PATCH = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { data: body, error: bodyError } = await validateBody(request, updateThemeSchemaBody)
    if (bodyError) return bodyError

    await connectToDatabase()

    const { id, action, ...updates } = body

    let theme

    if (action === 'activate') {
      theme = await themeRepository.setActive(id)
      // Invalidate the server-side theme cache so next page load gets the new active theme
      revalidateTag('theme', 'max')
    } else {
      theme = await themeRepository.update(id, updates)
    }

    if (!theme) {
      return errorResponse('Theme not found', 404, ErrorCodes.NOT_FOUND)
    }

    return successResponse({
      theme: {
        id: theme.id,
        name: theme.name,
        displayName: theme.displayName,
        description: theme.description,
        colors: theme.colors,
        gradients: theme.gradients,
        effects: theme.effects,
        coverImage: theme.coverImage,
        icon: theme.icon,
        isActive: theme.isActive,
        createdAt: theme.createdAt ? new Date(theme.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: theme.updatedAt ? new Date(theme.updatedAt).toISOString() : new Date().toISOString(),
        createdBy: theme.createdBy,
      }
    })
  } catch (error) {
    adminLogger.error({ err: error }, 'Error updating theme')
    return errorResponse('Failed to update theme', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * DELETE /api/admin/themes
 * Delete a theme (Admin only)
 */
export const DELETE = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { data: params, error: queryError } = await validateQuery(request, idQuerySchema)
    if (queryError) return queryError

    await connectToDatabase()

    const deleted = await themeRepository.delete(params.id)

    if (!deleted) {
      return errorResponse('Theme not found or cannot be deleted (active theme)', 400, ErrorCodes.VALIDATION_ERROR)
    }

    return successResponse({ success: true })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error deleting theme')
    return errorResponse(error.message || 'Failed to delete theme', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
