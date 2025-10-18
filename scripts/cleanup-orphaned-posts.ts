/**
 * Cleanup script for orphaned posts
 * Run with: npm run cleanup:orphaned-posts
 *
 * This script identifies and deletes posts that reference non-existent events.
 * Useful after deleting events or recovering from data inconsistencies.
 */

import dotenv from 'dotenv'
import { connectToDatabase } from '../lib/mongodb/connection'
import { eventRepository } from '../lib/mongodb/repositories'
import Post from '../lib/mongodb/models/Post'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function cleanupOrphanedPosts() {
  console.log('🔍 Starting orphaned posts cleanup...\n')

  try {
    // Connect to MongoDB
    await connectToDatabase()
    console.log('✅ Connected to MongoDB')

    // Get all valid event IDs
    const events = await eventRepository.findAll()
    const validEventIds = new Set(events.map(e => e.id))
    console.log(`📊 Found ${validEventIds.size} valid events\n`)

    // Get all posts
    const allPosts = await Post.find().lean()
    console.log(`📊 Found ${allPosts.length} total posts`)

    // Find orphaned posts
    const orphanedPosts = allPosts.filter((post: any) => !validEventIds.has(post.event_id))

    if (orphanedPosts.length === 0) {
      console.log('✨ No orphaned posts found. Database is clean!')
      process.exit(0)
    }

    console.log(`\n⚠️  Found ${orphanedPosts.length} orphaned posts:\n`)

    // Display orphaned posts
    orphanedPosts.forEach((post: any, index) => {
      console.log(`${index + 1}. Post ID: ${post.id}`)
      console.log(`   Event ID: ${post.event_id} (DELETED)`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Uploaded: ${post.uploaded_at}`)
      console.log(`   User: ${post.user_name || 'Unknown'}`)
      if (post.wish_text) {
        console.log(`   Text: "${post.wish_text.substring(0, 50)}${post.wish_text.length > 50 ? '...' : ''}"`)
      }
      console.log('')
    })

    // Confirm deletion
    console.log('🗑️  These posts will be permanently deleted.')
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

    await new Promise(resolve => setTimeout(resolve, 5000))

    // Delete orphaned posts
    const orphanedIds = orphanedPosts.map((post: any) => post.id)
    const result = await Post.deleteMany({ id: { $in: orphanedIds } })

    console.log(`✅ Successfully deleted ${result.deletedCount} orphaned posts`)
    console.log('🎉 Cleanup complete!')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run the cleanup
cleanupOrphanedPosts()
