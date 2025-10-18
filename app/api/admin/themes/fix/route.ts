import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { connectToDatabase } from '@/lib/mongodb/connection'
import Theme from '@/lib/mongodb/models/Theme'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/themes/fix
 * Fix database inconsistencies (multiple active themes)
 * Admin only
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      console.error('[FIX] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('[FIX] Starting database fix...')

    await connectToDatabase()

    // Find all active themes
    const activeThemes = await Theme.find({ isActive: true })
    console.log(`[FIX] Found ${activeThemes.length} active themes`)

    if (activeThemes.length <= 1) {
      return NextResponse.json({
        success: true,
        message: 'Database is already consistent',
        activeThemes: activeThemes.length
      })
    }

    // Multiple active themes found - fix it
    console.log('[FIX] Multiple active themes detected! Fixing...')

    // Deactivate all themes first
    await Theme.updateMany(
      {},
      { $set: { isActive: false } }
    )
    console.log('[FIX] All themes deactivated')

    // Activate only the 'default' theme (or first one if default doesn't exist)
    const defaultTheme = await Theme.findOne({ name: 'default' })
    if (defaultTheme) {
      await Theme.findOneAndUpdate(
        { id: defaultTheme.id },
        { $set: { isActive: true } }
      )
      console.log(`[FIX] Activated default theme (ID: ${defaultTheme.id})`)

      return NextResponse.json({
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
        console.log(`[FIX] Activated first theme: ${firstTheme.name} (ID: ${firstTheme.id})`)

        return NextResponse.json({
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
        return NextResponse.json({
          success: false,
          message: 'No themes found in database',
          fixed: false
        })
      }
    }
  } catch (error) {
    console.error('[FIX] Error fixing themes:', error)
    return NextResponse.json(
      {
        error: 'Failed to fix themes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
