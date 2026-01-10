import { NextResponse } from 'next/server'
import { themeRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { apiLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/theme/active
 * Fetch the currently active theme
 */
export async function GET() {
  try {
    await connectToDatabase()

    const activeTheme = await themeRepository.findActive()

    if (!activeTheme) {
      // Return default theme if no active theme found
      return NextResponse.json({
        theme: themeRepository.getDefaultTheme(),
      })
    }

    // Convert MongoDB document to plain object
    const theme = {
      id: activeTheme.id,
      name: activeTheme.name,
      displayName: activeTheme.displayName,
      description: activeTheme.description,
      colors: activeTheme.colors,
      typography: activeTheme.typography,
      gradients: activeTheme.gradients,
      effects: activeTheme.effects,
      coverImage: activeTheme.coverImage,
      icon: activeTheme.icon,
      isActive: activeTheme.isActive,
      createdAt: activeTheme.createdAt.toISOString(),
      updatedAt: activeTheme.updatedAt.toISOString(),
      createdBy: activeTheme.createdBy,
    }

    return NextResponse.json({ theme })
  } catch (error) {
    apiLogger.error({ err: error }, 'Error fetching active theme')
    return NextResponse.json(
      { error: 'Failed to fetch active theme' },
      { status: 500 }
    )
  }
}
