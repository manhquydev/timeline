import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { beforeAll, afterAll, afterEach } from 'vitest'

let mongoServer: MongoMemoryServer | null = null

/**
 * Setup in-memory MongoDB for testing
 * Use in test files: import { setupTestDB } from '@/tests/utils/mongodb-test-utils'
 */
export async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
}

/**
 * Teardown MongoDB after tests
 */
export async function teardownTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongoServer) {
    await mongoServer.stop()
    mongoServer = null
  }
}

/**
 * Clear all collections between tests
 */
export async function clearTestDB() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

/**
 * Hook to use in describe blocks for MongoDB tests
 *
 * @example
 * describe('EventRepository', () => {
 *   useTestDB()
 *
 *   it('should create event', async () => {
 *     // test code
 *   })
 * })
 */
export function useTestDB() {
  beforeAll(async () => {
    await setupTestDB()
  })

  afterEach(async () => {
    await clearTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })
}

/**
 * Create test data factories
 */
export const createTestEvent = (overrides = {}) => ({
  id: `test-event-${Date.now()}`,
  title: 'Test Event',
  slug: 'test-event',
  description: 'Test description',
  date: new Date(),
  cover_url: 'https://example.com/cover.jpg',
  status: 'active' as const,
  is_public: true,
  settings: {
    allow_comments: true,
    require_approval: true,
    max_photos_per_user: 10,
  },
  stats: {
    total_posts: 0,
    approved_posts: 0,
    pending_posts: 0,
  },
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
})

export const createTestPost = (overrides = {}) => ({
  id: `test-post-${Date.now()}`,
  event_id: 'test-event-id',
  user_id: 'test-user-id',
  user_name: 'Test User',
  media_url: 'https://example.com/image.jpg',
  thumbnail_url: 'https://example.com/thumb.jpg',
  blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  wish_text: 'Test wish',
  status: 'pending' as const,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
})
