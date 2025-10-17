import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { themeRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectToDatabase()

    const themes = await themeRepository.findAll()

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

    return NextResponse.json({ themes: themesData })
  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/themes
 * Create a new theme (Admin only)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectToDatabase()

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.displayName || !body.colors) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const theme = await themeRepository.create({
      ...body,
      createdBy: user.id,
      isActive: false, // Don't activate automatically
    })

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to create theme' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/themes
 * Update or activate a theme (Admin only)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectToDatabase()

    const body = await request.json()
    const { id, action, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      )
    }

    let theme

    if (action === 'activate') {
      // Set this theme as active (automatically deactivates others)
      theme = await themeRepository.setActive(id)
    } else {
      // Update theme properties
      theme = await themeRepository.update(id, updates)
    }

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/themes
 * Delete a theme (Admin only)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      )
    }

    const deleted = await themeRepository.delete(id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Theme not found or cannot be deleted (active theme)' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting theme:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete theme' },
      { status: 500 }
    )
  }
}
