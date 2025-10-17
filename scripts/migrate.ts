import { migrateEvents, rollbackEventsMigration } from './migrate-events'
import { migratePosts, rollbackPostsMigration } from './migrate-posts'

/**
 * Complete migration from Supabase to MongoDB
 * Run this script to migrate all data
 */
async function runMigration() {
  console.log('🚀 Starting complete migration from Supabase to MongoDB\n')
  console.log('=' .repeat(60))

  try {
    // Step 1: Migrate Events
    console.log('\n📦 Step 1: Migrating Events')
    console.log('-'.repeat(60))
    const eventsResult = await migrateEvents()

    if (!eventsResult.success) {
      console.error('\n❌ Events migration completed with errors')
      console.log('⚠️  Please fix errors before migrating posts')
      process.exit(1)
    }

    // Step 2: Migrate Posts
    console.log('\n📦 Step 2: Migrating Posts')
    console.log('-'.repeat(60))
    const postsResult = await migratePosts()

    console.log('\n' + '='.repeat(60))
    console.log('✅ MIGRATION COMPLETED!')
    console.log('='.repeat(60))
    console.log('\n📊 Final Summary:')
    console.log(`   Events migrated: ${eventsResult.migrated}`)
    console.log(`   Events skipped: ${eventsResult.skipped}`)
    console.log(`   Posts migrated: ${postsResult.migrated}`)
    console.log(`   Posts skipped: ${postsResult.skipped}`)
    console.log(`   Event stats updated: ${postsResult.statsUpdated}`)

    if (postsResult.errors.length > 0) {
      console.log(`\n⚠️  ${postsResult.errors.length} posts failed to migrate`)
      console.log('Check the logs above for details')
    }

    console.log('\n✨ Next steps:')
    console.log('   1. Verify data in MongoDB Atlas')
    console.log('   2. Update API routes to use MongoDB')
    console.log('   3. Test the application thoroughly')
    console.log('   4. Update environment variables')
    console.log('   5. Deploy the changes')

    process.exit(0)
  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

/**
 * Rollback all migrations
 * USE WITH EXTREME CAUTION!
 */
async function runRollback() {
  console.log('⚠️  WARNING: This will delete ALL data from MongoDB!')
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

  // Wait 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000))

  try {
    console.log('\n🔄 Rolling back posts...')
    await rollbackPostsMigration()

    console.log('\n🔄 Rolling back events...')
    await rollbackEventsMigration()

    console.log('\n✅ Rollback completed successfully')
    process.exit(0)
  } catch (error: any) {
    console.error('\n💥 Rollback failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Parse command line arguments
const command = process.argv[2]

if (command === 'rollback') {
  runRollback()
} else {
  runMigration()
}
