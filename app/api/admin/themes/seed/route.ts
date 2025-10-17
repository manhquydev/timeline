import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { themeRepository } from '@/lib/mongodb/repositories'
import { PREDEFINED_THEMES } from '@/lib/themes/predefined-themes'
import { connectToDatabase } from '@/lib/mongodb/connection'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/themes/seed
 * Seed predefined themes into database (Admin only)
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectToDatabase()

    const results = []

    for (const themeData of PREDEFINED_THEMES) {
      // Check if theme already exists
      const existing = await themeRepository.findByName(themeData.name)

      if (existing) {
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
        createdBy: user.id,
        isActive: themeData.name === 'default', // Set default theme as active
      })

      results.push({
        name: theme.name,
        status: 'created',
        id: theme.id
      })
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Seeded ${results.filter(r => r.status === 'created').length} themes`
    })
  } catch (error) {
    console.error('Error seeding themes:', error)
    return NextResponse.json(
      { error: 'Failed to seed themes' },
      { status: 500 }
    )
  }
}
