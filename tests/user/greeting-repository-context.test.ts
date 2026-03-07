import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  aggregate: vi.fn(),
}))

vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/mongodb/models/Greeting', () => ({
  default: {
    aggregate: mocks.aggregate,
    findOne: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
    create: vi.fn(),
  },
}))

import { GreetingRepository } from '@/lib/mongodb/repositories/greeting-repository'

describe('GreetingRepository.findRandomByEventContext', () => {
  const repository = new GreetingRepository()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses strict eventId query when eventId is provided', async () => {
    mocks.aggregate.mockResolvedValueOnce([{ id: 'greeting_1' }])

    await repository.findRandomByEventContext('evt_8_3', 'qtpn2026')

    expect(mocks.aggregate).toHaveBeenCalledWith([
      { $match: { isApproved: true, isDeleted: false, eventId: 'evt_8_3' } },
      { $sample: { size: 1 } },
    ])
  })

  it('falls back to eventTag only when eventId is missing', async () => {
    mocks.aggregate.mockResolvedValueOnce([{ id: 'greeting_2' }])

    await repository.findRandomByEventContext(null, 'qtpn2026')

    expect(mocks.aggregate).toHaveBeenCalledWith([
      { $match: { isApproved: true, isDeleted: false, eventTag: 'qtpn2026' } },
      { $sample: { size: 1 } },
    ])
  })

  it('returns null and does not query when both eventId and eventTag are empty', async () => {
    const result = await repository.findRandomByEventContext(null, null)

    expect(result).toBeNull()
    expect(mocks.aggregate).not.toHaveBeenCalled()
  })
})
