import { connectToDatabase } from '@/lib/mongodb/connection'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'

/**
 * Verify data integrity after migration
 */
async function verifyMigration() {
  console.log('🔍 Verifying migration data integrity...\n')

  try {
    await connectToDatabase()

    // Check events
    const events = await eventRepository.findAll()
    console.log(`📊 Events in MongoDB: ${events.length}`)

    // Check posts
    const Event = (await import('@/lib/mongodb/models')).Event
    const Post = (await import('@/lib/mongodb/models')).Post
    const totalPosts = await Post.countDocuments()
    console.log(`📊 Posts in MongoDB: ${totalPosts}`)

    // Verify event stats
    console.log('\n🔍 Verifying event statistics...')
    let statsCorrect = 0
    let statsIncorrect = 0

    for (const event of events) {
      const stats = await postRepository.getEventStats(event.id)
      const currentStats = event.stats

      if (
        stats.total_photos === currentStats.total_photos &&
        stats.total_videos === currentStats.total_videos &&
        stats.total_contributors === currentStats.total_contributors
      ) {
        statsCorrect++
      } else {
        statsIncorrect++
        console.log(`⚠️  Event "${event.title}" has incorrect stats:`)
        console.log(`   Current: ${JSON.stringify(currentStats)}`)
        console.log(`   Expected: ${JSON.stringify(stats)}`)
      }
    }

    console.log(`\n✅ Events with correct stats: ${statsCorrect}`)
    console.log(`❌ Events with incorrect stats: ${statsIncorrect}`)

    // Check for orphaned posts (posts without events)
    console.log('\n🔍 Checking for orphaned posts...')
    let orphanedPosts = 0

    for (const event of events) {
      const posts = await postRepository.findByEvent(event.id)
      for (const post of posts) {
        const eventExists = await eventRepository.findById(post.event_id)
        if (!eventExists) {
          orphanedPosts++
          console.log(`⚠️  Orphaned post found: ${post.id}`)
        }
      }
    }

    if (orphanedPosts === 0) {
      console.log('✅ No orphaned posts found')
    } else {
      console.log(`❌ Found ${orphanedPosts} orphaned posts`)
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Verification Summary:')
    console.log('='.repeat(60))
    console.log(`Events: ${events.length}`)
    console.log(`Posts: ${totalPosts}`)
    console.log(`Stats correct: ${statsCorrect}/${events.length}`)
    console.log(`Orphaned posts: ${orphanedPosts}`)

    const allGood = statsIncorrect === 0 && orphanedPosts === 0
    if (allGood) {
      console.log('\n✅ Migration verification PASSED!')
    } else {
      console.log('\n⚠️  Migration verification found issues')
    }

    process.exit(allGood ? 0 : 1)
  } catch (error: any) {
    console.error('💥 Verification failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

verifyMigration()
