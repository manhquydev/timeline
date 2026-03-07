import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/mongodb/connection', () => ({ connectToDatabase: vi.fn() }))
vi.mock('@/lib/mongodb/models', () => ({
  Post: {
    countDocuments: vi.fn(),
    distinct: vi.fn(),
    aggregate: vi.fn(),
  },
  Event: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}))

import { getAdminStats } from '@/lib/services/admin-stats-service'
import { Post, Event } from '@/lib/mongodb/models'

const mockPost = vi.mocked(Post)
const mockEvent = vi.mocked(Event)

// Helper: set up week-split mock for countDocuments
// thisWeek = count when only $gte present; lastWeek = count when $lt present
function mockWeeklyCounts({
  approved = 0,
  postsThisWeek = 0,
  postsLastWeek = 0,
  eventsThisWeek = 0,
  eventsLastWeek = 0,
} = {}) {
  mockPost.countDocuments.mockImplementation(async (filter: any = {}) => {
    if (filter.status === 'approved') return approved
    if (filter.status === 'pending') return 0
    if (filter.uploaded_at) {
      return filter.uploaded_at.$lt ? postsLastWeek : postsThisWeek
    }
    return 0
  })
  mockEvent.countDocuments.mockImplementation(async (filter: any = {}) => {
    if (filter.created_at?.$lt) return eventsLastWeek
    return eventsThisWeek
  })
}

describe('Growth trend calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEvent.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as any)
    mockPost.distinct.mockResolvedValue([])
  })

  it('calculates positive growth when thisWeek > lastWeek', async () => {
    mockWeeklyCounts({ postsThisWeek: 10, postsLastWeek: 5 })

    const stats = await getAdminStats()

    // (10-5)/5 * 100 = 100%
    expect(stats.photosTrend).toBe(100)
  })

  it('calculates negative growth when thisWeek < lastWeek', async () => {
    mockWeeklyCounts({ postsThisWeek: 3, postsLastWeek: 6 })

    const stats = await getAdminStats()

    // (3-6)/6 * 100 = -50%
    expect(stats.photosTrend).toBe(-50)
  })

  it('reports 0 trend when thisWeek equals lastWeek', async () => {
    mockWeeklyCounts({ postsThisWeek: 4, postsLastWeek: 4 })

    const stats = await getAdminStats()

    expect(stats.photosTrend).toBe(0)
  })

  it('reports 100 trend when lastWeek was 0 and thisWeek is positive', async () => {
    mockWeeklyCounts({ postsThisWeek: 1, postsLastWeek: 0 })

    const stats = await getAdminStats()

    expect(stats.photosTrend).toBe(100)
  })

  it('reports undefined when both this and last week are 0', async () => {
    mockWeeklyCounts({ postsThisWeek: 0, postsLastWeek: 0 })

    const stats = await getAdminStats()

    expect(stats.photosTrend).toBeUndefined()
  })

  it('rounds trend to integers', async () => {
    mockWeeklyCounts({ postsThisWeek: 10, postsLastWeek: 3 })

    const stats = await getAdminStats()

    // (10-3)/3 * 100 = 233.33... → 233
    expect(Number.isInteger(stats.photosTrend)).toBe(true)
  })
})

describe('Top contributor tracking (user_name based)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEvent.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as any)
    mockEvent.countDocuments.mockResolvedValue(0)
    mockPost.countDocuments.mockResolvedValue(0)
  })

  it('counts contributors by user_name distinct values', async () => {
    mockPost.distinct.mockResolvedValue(['alice', 'bob', 'charlie'])

    const stats = await getAdminStats()

    expect(stats.totalContributors).toBe(3)
    // Verify field used is user_name
    expect(mockPost.distinct).toHaveBeenCalledWith('user_name', expect.any(Object))
  })

  it('ignores null and empty user_name when counting contributors', async () => {
    mockPost.distinct.mockResolvedValue(['alice', null, '', undefined, 'bob'])

    const stats = await getAdminStats()

    expect(stats.totalContributors).toBe(2)
  })

  it('returns 0 contributors when no posts exist', async () => {
    mockPost.distinct.mockResolvedValue([])

    const stats = await getAdminStats()

    expect(stats.totalContributors).toBe(0)
  })
})

describe('Analytics with empty collections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEvent.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as any)
    mockEvent.countDocuments.mockResolvedValue(0)
    mockPost.countDocuments.mockResolvedValue(0)
    mockPost.distinct.mockResolvedValue([])
  })

  it('handles completely empty post collection without errors', async () => {
    await expect(getAdminStats()).resolves.toMatchObject({
      totalEvents: 0,
      totalPhotos: 0,
      totalContributors: 0,
      openEvents: 0,
    })
  })

  it('does not throw on empty event list', async () => {
    mockEvent.find.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as any)

    const stats = await getAdminStats()

    expect(stats.openEvents).toBe(0)
    expect(stats.totalEvents).toBe(0)
  })

  it('queries use uploaded_at field for Posts, not created_at', async () => {
    await getAdminStats()

    const allPostFilterArgs = mockPost.countDocuments.mock.calls
      .filter(([filter]) => filter && typeof filter === 'object')
      .map(([filter]) => filter)

    // Any date filter on Post must use uploaded_at
    const postDateFilters = allPostFilterArgs.filter(
      (f: any) => f.uploaded_at !== undefined || f.created_at !== undefined
    )
    const badFilters = postDateFilters.filter((f: any) => f.created_at !== undefined)
    expect(badFilters).toHaveLength(0)
  })
})
