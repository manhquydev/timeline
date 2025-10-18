/**
 * Add MongoDB Indexes for Performance Optimization
 * Run: npx tsx scripts/add-db-indexes.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { connectToDatabase } from '../lib/mongodb/connection'
import mongoose from 'mongoose'

async function addIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await connectToDatabase()

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    console.log('✅ Connected to MongoDB\n')

    // Events Collection Indexes
    console.log('📊 Adding indexes to events collection...')
    const eventsCollection = db.collection('events')

    await eventsCollection.createIndex({ slug: 1 }, { unique: true })
    console.log('  ✓ Created unique index on slug')

    await eventsCollection.createIndex({ status: 1 })
    console.log('  ✓ Created index on status')

    await eventsCollection.createIndex({ event_date: -1 })
    console.log('  ✓ Created index on event_date (descending)')

    await eventsCollection.createIndex({ start_date: -1, end_date: -1 })
    console.log('  ✓ Created compound index on start_date, end_date')

    await eventsCollection.createIndex({ created_at: -1 })
    console.log('  ✓ Created index on created_at (descending)')

    // Posts Collection Indexes
    console.log('\n📊 Adding indexes to posts collection...')
    const postsCollection = db.collection('posts')

    await postsCollection.createIndex({ event_id: 1, status: 1 })
    console.log('  ✓ Created compound index on event_id, status')

    await postsCollection.createIndex({ user_id: 1 })
    console.log('  ✓ Created index on user_id')

    await postsCollection.createIndex({ status: 1 })
    console.log('  ✓ Created index on status')

    await postsCollection.createIndex({ uploaded_at: -1 })
    console.log('  ✓ Created index on uploaded_at (descending)')

    await postsCollection.createIndex({ event_id: 1, uploaded_at: -1 })
    console.log('  ✓ Created compound index on event_id, uploaded_at')

    // Themes Collection Indexes
    console.log('\n📊 Adding indexes to themes collection...')
    const themesCollection = db.collection('themes')

    await themesCollection.createIndex({ name: 1 }, { unique: true })
    console.log('  ✓ Created unique index on name')

    await themesCollection.createIndex({ isActive: 1 })
    console.log('  ✓ Created index on isActive')

    // List all indexes
    console.log('\n📋 Listing all indexes:')

    console.log('\nEvents indexes:')
    const eventIndexes = await eventsCollection.indexes()
    eventIndexes.forEach(idx => console.log(`  - ${JSON.stringify(idx.key)}`))

    console.log('\nPosts indexes:')
    const postIndexes = await postsCollection.indexes()
    postIndexes.forEach(idx => console.log(`  - ${JSON.stringify(idx.key)}`))

    console.log('\nThemes indexes:')
    const themeIndexes = await themesCollection.indexes()
    themeIndexes.forEach(idx => console.log(`  - ${JSON.stringify(idx.key)}`))

    console.log('\n✅ All indexes created successfully!')
    console.log('\n📈 Performance Tips:')
    console.log('  • Indexes speed up queries but add overhead to writes')
    console.log('  • Monitor slow queries with MongoDB Atlas Performance Advisor')
    console.log('  • Consider TTL indexes for auto-cleanup of old data')

  } catch (error) {
    console.error('❌ Error adding indexes:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

addIndexes()
