#!/usr/bin/env tsx
/**
 * Script to recalculate event statistics
 * This will update total_photos, total_videos, and total_contributors for all events
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

import { eventRepository, postRepository } from '../lib/mongodb/repositories'
import { updateEventStats } from '../lib/mongodb/utils/stats-updater'

async function recalculateStats() {
  console.log('🔄 Starting event stats recalculation...\n')

  try {
    // Get all events
    const events = await eventRepository.findAll()
    console.log(`📊 Found ${events.length} events to process\n`)

    for (const event of events) {
      console.log(`\n📍 Processing event: ${event.title} (${event.id})`)

      // Get current stats
      console.log(`   Current stats:`)
      console.log(`   - Photos: ${event.stats.total_photos}`)
      console.log(`   - Videos: ${event.stats.total_videos}`)
      console.log(`   - Contributors: ${event.stats.total_contributors}`)

      // Recalculate stats
      await updateEventStats(event.id)

      // Get updated event
      const updatedEvent = await eventRepository.findById(event.id)
      if (updatedEvent) {
        console.log(`   ✅ Updated stats:`)
        console.log(`   - Photos: ${updatedEvent.stats.total_photos}`)
        console.log(`   - Videos: ${updatedEvent.stats.total_videos}`)
        console.log(`   - Contributors: ${updatedEvent.stats.total_contributors}`)
      }
    }

    console.log('\n\n✅ All event stats recalculated successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error recalculating stats:', error)
    process.exit(1)
  }
}

recalculateStats()
