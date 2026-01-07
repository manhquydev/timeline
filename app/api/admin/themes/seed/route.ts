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
      console.error('[SEED] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('[SEED] Starting theme seeding process...')
    console.log('[SEED] User ID:', user.id)
    console.log('[SEED] Predefined themes count:', PREDEFINED_THEMES.length)

    await connectToDatabase()

    const results = []

    for (const themeData of PREDEFINED_THEMES) {
      console.log(`[SEED] Processing theme: ${themeData.name}`)

      // Check if theme already exists
      const existing = await themeRepository.findOne({ name: themeData.name })

      if (existing) {
        console.log(`[SEED] Theme "${themeData.name}" already exists, skipping`)
        results.push({
          name: themeData.name,
          status: 'skipped',
          message: 'Theme already exists'
        })
        continue
      }

      // Create the theme
      console.log(`[SEED] Creating theme: ${themeData.name}`)
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

      console.log(`[SEED] Successfully created theme: ${theme.name} (ID: ${theme.id})`)
      results.push({
        name: theme.name,
        status: 'created',
        id: theme.id
      })
    }

    const createdCount = results.filter(r => r.status === 'created').length
    console.log(`[SEED] Seeding complete! Created: ${createdCount}, Skipped: ${results.length - createdCount}`)

    return NextResponse.json({
      success: true,
      results,
      message: `Đã tạo ${createdCount} themes, bỏ qua ${results.length - createdCount} themes đã tồn tại`,
      details: results
    })
  } catch (error) {
    console.error('[SEED] Error seeding themes:', error)
    return NextResponse.json(
      {
        error: 'Failed to seed themes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
