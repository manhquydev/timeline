import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { themeRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { successResponse, errorResponse, ErrorCodes, validateBody, validateQuery } from '@/lib/api-utils'
import { createThemeSchema, updateThemeSchemaBody, idQuerySchema } from '@/lib/validations'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/themes
 * List all themes (Admin only)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized', 403, ErrorCodes.FORBIDDEN)
    }

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
      createdAt: theme.createdAt.toISOString(),
      updatedAt: theme.updatedAt.toISOString(),
      createdBy: theme.createdBy,
    }))

    return successResponse({ themes: themesData })
  } catch (error) {
    console.error('Error fetching themes:', error)
    return errorResponse('Failed to fetch themes', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * POST /api/admin/themes
 * Create a new theme (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized', 403, ErrorCodes.FORBIDDEN)
    }

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
        createdAt: theme.createdAt.toISOString(),
        updatedAt: theme.updatedAt.toISOString(),
        createdBy: theme.createdBy,
      }
    })
  } catch (error) {
    console.error('Error creating theme:', error)
    return errorResponse('Failed to create theme', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * PATCH /api/admin/themes
 * Update or activate a theme (Admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: body, error: bodyError } = await validateBody(request, updateThemeSchemaBody)
    if (bodyError) return bodyError

    await connectToDatabase()

    const { id, action, ...updates } = body

    let theme

    if (action === 'activate') {
      theme = await themeRepository.setActive(id)
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
        createdAt: theme.createdAt.toISOString(),
        updatedAt: theme.updatedAt.toISOString(),
        createdBy: theme.createdBy,
      }
    })
  } catch (error) {
    console.error('Error updating theme:', error)
    return errorResponse('Failed to update theme', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * DELETE /api/admin/themes
 * Delete a theme (Admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: params, error: queryError } = await validateQuery(request, idQuerySchema)
    if (queryError) return queryError

    await connectToDatabase()

    const deleted = await themeRepository.delete(params.id)

    if (!deleted) {
      return errorResponse('Theme not found or cannot be deleted (active theme)', 400, ErrorCodes.VALIDATION_ERROR)
    }

    return successResponse({ success: true })
  } catch (error: any) {
    console.error('Error deleting theme:', error)
    return errorResponse(error.message || 'Failed to delete theme', 500, ErrorCodes.INTERNAL_ERROR)
  }
}
