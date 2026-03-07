import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const PostModel = {
    find: vi.fn(),
    deleteMany: vi.fn(),
  }

  const findChain = {
    lean: vi.fn(),
  }

  return {
    adminUser: {
      id: 'admin_1',
      email: 'admin@example.com',
      role: 'admin',
    },
    eventRepository: {
      findAll: vi.fn(),
    },
    PostModel,
    findChain,
  }
})

vi.mock('@/lib/api-utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-utils')>('@/lib/api-utils')
  return {
    ...actual,
    withAdmin:
      (handler: any) =>
      async (request: NextRequest) =>
        handler(request, { user: mocks.adminUser, supabase: {}, request }),
  }
})

vi.mock('@/lib/mongodb/repositories', () => ({
  eventRepository: mocks.eventRepository,
}))

vi.mock('@/lib/mongodb/models', () => ({
  Post: mocks.PostModel,
}))

vi.mock('@/lib/logger', () => ({
  adminLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { POST } from '@/app/api/admin/cleanup/route'

describe('Admin Cleanup API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.PostModel.find.mockReturnValue(mocks.findChain)
    mocks.PostModel.deleteMany.mockResolvedValue({ deletedCount: 0 })
  })

  it('returns early when no orphaned posts are found', async () => {
    mocks.eventRepository.findAll.mockResolvedValue([
      { id: 'evt_1' },
      { id: 'evt_2' },
    ])
    mocks.findChain.lean.mockResolvedValue([
      { id: 'post_1', event_id: 'evt_1' },
      { id: 'post_2', event_id: 'evt_2' },
    ])

    const response = await POST(
      new NextRequest('http://localhost/api/admin/cleanup', { method: 'POST' }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.deletedCount).toBe(0)
    expect(mocks.PostModel.deleteMany).not.toHaveBeenCalled()
  })

  it('deletes orphaned posts and returns affected ids', async () => {
    mocks.eventRepository.findAll.mockResolvedValue([{ id: 'evt_1' }])
    mocks.findChain.lean.mockResolvedValue([
      { id: 'post_1', event_id: 'evt_1' },
      { id: 'post_2', event_id: 'missing_evt' },
      { id: 'post_3', event_id: 'missing_evt_2' },
    ])
    mocks.PostModel.deleteMany.mockResolvedValue({ deletedCount: 2 })

    const response = await POST(
      new NextRequest('http://localhost/api/admin/cleanup', { method: 'POST' }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.deletedCount).toBe(2)
    expect(body.data.orphanedPostIds).toEqual(['post_2', 'post_3'])
    expect(mocks.PostModel.deleteMany).toHaveBeenCalledWith({
      id: { $in: ['post_2', 'post_3'] },
    })
  })
})
