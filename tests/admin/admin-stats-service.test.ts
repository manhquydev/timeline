import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: vi.fn(),
}))

vi.mock('@/lib/mongodb/models', () => ({
  Post: {
    countDocuments: vi.fn(),
    distinct: vi.fn(),
  },
  Event: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}))

import { getAdminStats, getPendingPostsCount, getRecentEvents } from '@/lib/services/admin-stats-service'
import { Post, Event } from '@/lib/mongodb/models'

const mockPost = vi.mocked(Post)
const mockEvent = vi.mocked(Event)

describe('getAdminStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: Event.find().lean() returns empty array
    mockEvent.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as any)
    mockEvent.countDocuments.mockResolvedValue(0)
    mockPost.countDocuments.mockResolvedValue(0)
    mockPost.distinct.mockResolvedValue([])
  })

  it('returns all required fields', async () => {
    mockEvent.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as any)
    mockPost.countDocuments.mockResolvedValue(5)
    mockPost.distinct.mockResolvedValue(['alice', 'bob'])

    const stats = await getAdminStats()

    expect(stats).toMatchObject({
      totalEvents: expect.any(Number),
      totalPhotos: expect.any(Number),
      totalContributors: expect.any(Number),
      openEvents: expect.any(Number),
    })
  })

  it('counts open events by filtering status === "open"', async () => {
    const events = [
      { status: 'open' },
      { status: 'open' },
      { status: 'closed' },
    ]
    mockEvent.find.mockReturnValue({ lean: vi.fn().mockResolvedValue(events) } as any)

    const stats = await getAdminStats()

    expect(stats.totalEvents).toBe(3)
    expect(stats.openEvents).toBe(2)
  })

  it('uses uploaded_at (not created_at) for Post trend queries', async () => {
    await getAdminStats()

    const calls = mockPost.countDocuments.mock.calls
    const trendCalls = calls.filter(([filter]) => filter && filter.uploaded_at)
    // Should have at least 2 calls with uploaded_at for this-week and last-week
    expect(trendCalls.length).toBeGreaterThanOrEqual(2)
    // Ensure no call uses created_at for posts
    const badCalls = calls.filter(([filter]) => filter && filter.created_at)
    expect(badCalls.length).toBe(0)
  })

  it('uses user_name (not user_id) for distinct contributor queries', async () => {
    await getAdminStats()

    const calls = mockPost.distinct.mock.calls
    expect(calls.every(([field]) => field === 'user_name')).toBe(true)
  })

  it('filters out null/empty user_names from contributor count', async () => {
    mockPost.distinct.mockResolvedValue(['alice', null, '', 'bob', null])

    const stats = await getAdminStats()

    // 2 valid names (alice, bob)
    expect(stats.totalContributors).toBe(2)
  })

  it('calculates photosTrend as 100 when previous week is 0 and current is positive', async () => {
    mockPost.countDocuments.mockImplementation(async (filter) => {
      if (filter?.status === 'approved') return 10
      if (filter?.uploaded_at?.$gte && !filter?.uploaded_at?.$lt) return 5  // this week
      if (filter?.uploaded_at?.$lt) return 0  // last week
      return 0
    })

    const stats = await getAdminStats()

    expect(stats.photosTrend).toBe(100)
  })

  it('leaves trend undefined when both periods are 0', async () => {
    mockPost.countDocuments.mockResolvedValue(0)
    mockEvent.countDocuments.mockResolvedValue(0)

    const stats = await getAdminStats()

    expect(stats.photosTrend).toBeUndefined()
    expect(stats.eventsTrend).toBeUndefined()
  })

  it('throws when database connection fails', async () => {
    const { connectToDatabase } = await import('@/lib/mongodb/connection')
    vi.mocked(connectToDatabase).mockRejectedValueOnce(new Error('DB connection failed'))

    await expect(getAdminStats()).rejects.toThrow('DB connection failed')
  })
})

describe('getPendingPostsCount', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns count of pending posts', async () => {
    mockPost.countDocuments.mockResolvedValue(7)

    const count = await getPendingPostsCount()

    expect(count).toBe(7)
    expect(mockPost.countDocuments).toHaveBeenCalledWith({ status: 'pending' })
  })

  it('returns 0 when no pending posts', async () => {
    mockPost.countDocuments.mockResolvedValue(0)

    const count = await getPendingPostsCount()

    expect(count).toBe(0)
  })
})

describe('getRecentEvents', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns events sorted by created_at descending with default limit 5', async () => {
    const mockEvents = [{ id: '1', name: 'Event 1' }]
    const mockLean = vi.fn().mockResolvedValue(mockEvents)
    const mockLimit = vi.fn().mockReturnValue({ lean: mockLean })
    const mockSort = vi.fn().mockReturnValue({ limit: mockLimit })
    mockEvent.find.mockReturnValue({ sort: mockSort } as any)

    const events = await getRecentEvents()

    expect(events).toEqual(mockEvents)
    expect(mockSort).toHaveBeenCalledWith({ created_at: -1 })
    expect(mockLimit).toHaveBeenCalledWith(5)
  })

  it('respects custom limit parameter', async () => {
    const mockLean = vi.fn().mockResolvedValue([])
    const mockLimit = vi.fn().mockReturnValue({ lean: mockLean })
    const mockSort = vi.fn().mockReturnValue({ limit: mockLimit })
    mockEvent.find.mockReturnValue({ sort: mockSort } as any)

    await getRecentEvents(10)

    expect(mockLimit).toHaveBeenCalledWith(10)
  })

  it('returns empty array when no events exist', async () => {
    const mockLean = vi.fn().mockResolvedValue([])
    const mockLimit = vi.fn().mockReturnValue({ lean: mockLean })
    const mockSort = vi.fn().mockReturnValue({ limit: mockLimit })
    mockEvent.find.mockReturnValue({ sort: mockSort } as any)

    const events = await getRecentEvents()

    expect(events).toEqual([])
  })
})
