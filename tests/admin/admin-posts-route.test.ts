import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  adminUser: {
    id: 'admin_1',
    email: 'admin@example.com',
    role: 'admin',
  },
  remove: vi.fn(),
  supabaseContext: {
    storage: {
      from: vi.fn(),
    },
  },
  postRepository: {
    approve: vi.fn(),
    reject: vi.fn(),
    findById: vi.fn(),
    delete: vi.fn(),
  },
  updateEventStats: vi.fn(),
  logPostModeration: vi.fn(),
  logPostDeletion: vi.fn(),
}))

vi.mock('@/lib/api-utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-utils')>('@/lib/api-utils')
  return {
    ...actual,
    withAdmin:
      (handler: any) =>
      async (request: NextRequest) =>
        handler(request, { user: mocks.adminUser, supabase: mocks.supabaseContext, request }),
  }
})

vi.mock('@/lib/mongodb/repositories', () => ({
  postRepository: mocks.postRepository,
}))

vi.mock('@/lib/mongodb/utils/stats-updater', () => ({
  updateEventStats: mocks.updateEventStats,
}))

vi.mock('@/lib/services/audit-service', () => ({
  logPostModeration: mocks.logPostModeration,
  logPostDeletion: mocks.logPostDeletion,
}))

vi.mock('@/lib/logger', () => ({
  adminLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { POST } from '@/app/api/admin/posts/route'

function jsonRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/posts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('Admin Posts API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.remove.mockResolvedValue({ error: null })
    mocks.supabaseContext.storage.from.mockReturnValue({
      remove: mocks.remove,
    })

    mocks.updateEventStats.mockResolvedValue(undefined)
    mocks.logPostModeration.mockResolvedValue(undefined)
    mocks.logPostDeletion.mockResolvedValue(undefined)
  })

  it('approves post, logs audit, and updates event stats', async () => {
    mocks.postRepository.approve.mockResolvedValue({
      id: 'post_1',
      event_id: 'evt_1',
      status: 'approved',
    })

    const response = await POST(
      jsonRequest({ postId: 'post_1', action: 'approve' }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mocks.postRepository.approve).toHaveBeenCalledWith('post_1')
    expect(mocks.logPostModeration).toHaveBeenCalledWith(
      expect.any(NextRequest),
      { id: 'admin_1', email: 'admin@example.com' },
      'post_1',
      'pending',
      'approved',
    )
    expect(mocks.updateEventStats).toHaveBeenCalledWith('evt_1')
  })

  it('rejects post and updates event stats', async () => {
    mocks.postRepository.reject.mockResolvedValue({
      id: 'post_2',
      event_id: 'evt_9',
      status: 'rejected',
    })

    const response = await POST(
      jsonRequest({ postId: 'post_2', action: 'reject' }),
    )

    expect(response.status).toBe(200)
    expect(mocks.postRepository.reject).toHaveBeenCalledWith('post_2')
    expect(mocks.logPostModeration).toHaveBeenCalledWith(
      expect.any(NextRequest),
      { id: 'admin_1', email: 'admin@example.com' },
      'post_2',
      'pending',
      'rejected',
    )
    expect(mocks.updateEventStats).toHaveBeenCalledWith('evt_9')
  })

  it('deletes post, removes media files, logs audit, and updates stats', async () => {
    mocks.postRepository.findById.mockResolvedValue({
      id: 'post_3',
      event_id: 'evt_7',
      status: 'approved',
      media_url: 'https://cdn.test/storage/v1/object/public/event-media/evt_7/user_1/main.webp',
      thumbnail_url: 'https://cdn.test/storage/v1/object/public/event-media/evt_7/user_1/main_thumb.webp',
    })
    mocks.postRepository.delete.mockResolvedValue(true)

    const response = await POST(
      jsonRequest({ postId: 'post_3', action: 'delete' }),
    )

    expect(response.status).toBe(200)
    expect(mocks.remove).toHaveBeenCalledWith(['evt_7/user_1/main.webp'])
    expect(mocks.remove).toHaveBeenCalledWith(['evt_7/user_1/main_thumb.webp'])
    expect(mocks.postRepository.delete).toHaveBeenCalledWith('post_3')
    expect(mocks.logPostDeletion).toHaveBeenCalledWith(
      expect.any(NextRequest),
      { id: 'admin_1', email: 'admin@example.com' },
      'post_3',
      'approved',
    )
    expect(mocks.updateEventStats).toHaveBeenCalledWith('evt_7')
  })

  it('returns 400 for invalid action payload', async () => {
    const response = await POST(
      jsonRequest({ postId: 'post_4', action: 'archive' }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('returns 500 when moderation action cannot be performed', async () => {
    mocks.postRepository.approve.mockResolvedValue(null)

    const response = await POST(
      jsonRequest({ postId: 'post_missing', action: 'approve' }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Failed to perform action')
    expect(mocks.updateEventStats).not.toHaveBeenCalled()
  })
})
