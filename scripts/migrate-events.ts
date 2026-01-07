import { createClient } from '@/lib/supabase/server'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { eventRepository } from '@/lib/mongodb/repositories'
import type { Database } from '@/lib/supabase/database.types'

type SupabaseEvent = Database['public']['Tables']['events']['Row']

/**
 * Migrate events from Supabase to MongoDB
 * This script can be run multiple times safely (idempotent)
 */
export async function migrateEvents() {
  console.log('🚀 Starting events migration from Supabase to MongoDB...')

  try {
    // Connect to both databases
    await connectToDatabase()
    const supabase = await createClient()

    // Fetch all events from Supabase
    const { data: supabaseEvents, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: true })
      .returns<SupabaseEvent[]>()

    if (error) {
      throw new Error(`Failed to fetch events from Supabase: ${error.message}`)
    }

    if (!supabaseEvents || supabaseEvents.length === 0) {
      console.log('⚠️  No events found in Supabase')
      return { success: true, migrated: 0, skipped: 0, errors: [] }
    }

    console.log(`📊 Found ${supabaseEvents.length} events in Supabase`)

    let migrated = 0
    let skipped = 0
    const errors: Array<{ id: string; error: string }> = []

    // Migrate each event
    for (const supabaseEvent of supabaseEvents) {
      try {
        // Check if event already exists in MongoDB
        const existingEvent = await eventRepository.findById(supabaseEvent.id)

        if (existingEvent) {
          console.log(`⏭️  Event "${supabaseEvent.title}" already exists, skipping...`)
          skipped++
          continue
        }

        // Transform Supabase event to MongoDB format
        const mongoEvent = {
          id: supabaseEvent.id,
          title: supabaseEvent.title,
          description: supabaseEvent.description,
          slug: supabaseEvent.slug,
          event_date: new Date(supabaseEvent.event_date),
          start_date: new Date(supabaseEvent.start_date),
          end_date: supabaseEvent.end_date ? new Date(supabaseEvent.end_date) : null,
          status: supabaseEvent.status as 'draft' | 'open' | 'closed' | 'archived',
          allow_upload: supabaseEvent.allow_upload,
          allow_wishes: supabaseEvent.allow_wishes,
          cover_image_url: supabaseEvent.cover_image_url,
          branding: {}, // Initialize with empty defaults
        }

        // Create event in MongoDB (repository will handle stats initialization)
        await eventRepository.create(mongoEvent)

        console.log(`✅ Migrated event: "${supabaseEvent.title}"`)
        migrated++
      } catch (err: any) {
        console.error(`❌ Error migrating event ${supabaseEvent.id}:`, err.message)
        errors.push({ id: supabaseEvent.id, error: err.message })
      }
    }

    console.log('\n📈 Migration Summary:')
    console.log(`   ✅ Migrated: ${migrated}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Failed migrations:')
      errors.forEach(({ id, error }) => {
        console.log(`   - ${id}: ${error}`)
      })
    }

    return {
      success: errors.length === 0,
      migrated,
      skipped,
      errors,
    }
  } catch (error: any) {
    console.error('💥 Migration failed:', error.message)
    throw error
  }
}

/**
 * Rollback: Delete all migrated events from MongoDB
 * USE WITH CAUTION!
 */
export async function rollbackEventsMigration() {
  console.log('⚠️  Rolling back events migration...')

  try {
    await connectToDatabase()
    const Event = (await import('@/lib/mongodb/models')).Event

    const result = await Event.deleteMany({})
    console.log(`✅ Deleted ${result.deletedCount} events from MongoDB`)

    return { success: true, deleted: result.deletedCount }
  } catch (error: any) {
    console.error('💥 Rollback failed:', error.message)
    throw error
  }
}
