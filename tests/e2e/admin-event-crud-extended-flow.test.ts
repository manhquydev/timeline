import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const state = {
    events: new Map<string, any>(),
    posts: new Map<string, any>(),
    postSeq: 0,
  }

  const authState = {
    user: { id: 'user_flow', email: 'user-flow@example.com' } as any,
  }

  const adminStorageRemove = vi.fn().mockResolvedValue({ error: null })

  const eventRepository = {
    findBySlug: vi.fn(async (slug: string) => {
      for (const event of state.events.values()) {
        if (event.slug === slug) return event
      }
      return null
    }),
    isSlugAvailable: vi.fn(async (slug: string) => {
      for (const event of state.events.values()) {
        if (event.slug === slug) return false
      }
      return true
    }),
    create: vi.fn(async (data: any) => {
      const id = `evt_${state.events.size + 1}`
      const event = { id, ...data }
      state.events.set(id, event)
      return event
    }),
    findById: vi.fn(async (id: string) => state.events.get(id) || null),
    update: vi.fn(async (id: string, patch: any) => {
      const current = state.events.get(id)
      if (!current) return null
      const updated = { ...current, ...patch, id }
      state.events.set(id, updated)
      return updated
    }),
    delete: vi.fn(async (id: string) => state.events.delete(id)),
  }

  const postRepository = {
    create: vi.fn(async (data: any) => {
      state.postSeq += 1
      const id = `post_${state.postSeq}`
      const post = { id, ...data }
      state.posts.set(id, post)
      return post
    }),
    findById: vi.fn(async (id: string) => state.posts.get(id) || null),
    approve: vi.fn(async (id: string) => {
      const post = state.posts.get(id)
      if (!post) return null
      const updated = { ...post, status: 'approved' }
      state.posts.set(id, updated)
      return updated
    }),
    reject: vi.fn(async (id: string) => {
      const post = state.posts.get(id)
      if (!post) return null
      const updated = { ...post, status: 'rejected' }
      state.posts.set(id, updated)
      return updated
    }),
    delete: vi.fn(async (id: string) => state.posts.delete(id)),
    deleteByEvent: vi.fn(async (eventId: string) => {
      let removed = 0
      for (const [id, post] of state.posts.entries()) {
        if (post.event_id === eventId) {
          state.posts.delete(id)
          removed += 1
        }
      }
      return removed
    }),
  }

  return {
    state,
    authState,
    adminUser: {
      id: 'admin_flow',
      email: 'admin-flow@example.com',
      role: 'admin',
    },
    adminSupabase: {
      storage: {
        from: vi.fn(() => ({
          remove: adminStorageRemove,
        })),
      },
    },
    eventRepository,
    postRepository,
    adminStorageRemove,
    logEventCreation: vi.fn(),
    logEventDeletion: vi.fn(),
    logPostDeletion: vi.fn(),
    logPostModeration: vi.fn(),
    updateEventStats: vi.fn().mockResolvedValue(undefined),
    validateUploadedFile: vi.fn().mockResolvedValue({ valid: true }),
    uploadLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    adminLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  }
})

vi.mock('@/lib/api-utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-utils')>('@/lib/api-utils')
  return {
    ...actual,
    withAdmin:
      (handler: any) =>
      async (request: NextRequest) =>
        handler(request, { user: mocks.adminUser, supabase: mocks.adminSupabase, request }),
  }
})

vi.mock('@/lib/mongodb/repositories', () => ({
  eventRepository: mocks.eventRepository,
  postRepository: mocks.postRepository,
}))

vi.mock('@/lib/services/audit-service', () => ({
  logEventCreation: mocks.logEventCreation,
  logEventDeletion: mocks.logEventDeletion,
  logPostDeletion: mocks.logPostDeletion,
  logPostModeration: mocks.logPostModeration,
}))

vi.mock('@/lib/mongodb/utils/stats-updater', () => ({
  updateEventStats: mocks.updateEventStats,
}))

vi.mock('@/lib/security/file-validation', () => ({
  validateUploadedFile: mocks.validateUploadedFile,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mocks.authState.user }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          display_name: 'User Flow',
          full_name: null,
          email: 'user-flow@example.com',
        },
        error: null,
      }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'ok' }, error: null }),
        getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://cdn.test/${path}` } })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  })),
}))

vi.mock('@/lib/mongodb/connection', () => ({ connectToDatabase: vi.fn().mockResolvedValue(undefined) }))

vi.mock('@/lib/logger', () => ({
  adminLogger: mocks.adminLogger,
  uploadLogger: mocks.uploadLogger,
}))

vi.mock('sharp', () => ({
  default: vi.fn(() => {
    const chain: any = {
      rotate: vi.fn(() => chain),
      metadata: vi.fn().mockResolvedValue({ width: 1280, height: 720 }),
      resize: vi.fn(() => chain),
      webp: vi.fn(() => chain),
      ensureAlpha: vi.fn(() => chain),
      raw: vi.fn(() => chain),
      toBuffer: vi.fn((opts?: any) => {
        if (opts?.resolveWithObject) {
          return Promise.resolve({
            data: Buffer.from([255, 255, 255, 255]),
            info: { width: 1, height: 1 },
          })
        }
        return Promise.resolve(Buffer.from('mock-image'))
      }),
    }
    return chain
  }),
}))

vi.mock('blurhash', () => ({
  encode: vi.fn(() => 'L6PZfS_NbHso00xtofWB00bcVst7'),
}))

import {
  GET as getEventBySlug,
  POST as createEvent,
  PATCH as updateEvent,
  DELETE as deleteEvent,
} from '@/app/api/admin/events/route'
import { POST as uploadFiles } from '@/app/api/upload/route'
import { POST as managePost } from '@/app/api/admin/posts/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function uploadRequest(eventId: string): NextRequest {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4])
  const file = new File([bytes], 'photo.jpg', { type: 'image/jpeg' })
  if (typeof (file as any).arrayBuffer !== 'function') {
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => bytes.buffer,
    })
  }
  const fakeFormData = {
    get: (key: string) => ({ eventId, wishText: 'Flow test upload' }[key] ?? null),
    getAll: (key: string) => (key === 'files' ? [file] : []),
  }
  return {
    formData: vi.fn().mockResolvedValue(fakeFormData),
    headers: new Headers(),
    url: 'http://localhost/api/upload',
  } as unknown as NextRequest
}

describe('E2E API Flow - Extended Event CRUD and moderation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.events.clear()
    mocks.state.posts.clear()
    mocks.state.postSeq = 0
    mocks.authState.user = { id: 'user_flow', email: 'user-flow@example.com' }
  })

  it('covers create -> edit -> get by slug -> upload -> delete post -> delete event', async () => {
    const createRes = await createEvent(
      jsonRequest('POST', 'http://localhost/api/admin/events', {
        title: 'Extended Lifecycle Event',
        slug: 'extended-lifecycle-event',
        event_date: '2026-06-01T00:00:00.000Z',
        start_date: '2026-06-01T08:00:00.000Z',
        end_date: '2026-06-01T11:00:00.000Z',
        status: 'draft',
        allow_upload: true,
      }),
    )
    const createBody = await createRes.json()
    const eventId = createBody.data.event.id as string

    expect(createRes.status).toBe(200)
    expect(mocks.logEventCreation).toHaveBeenCalledTimes(1)

    const patchRes = await updateEvent(
      jsonRequest('PATCH', 'http://localhost/api/admin/events', {
        id: eventId,
        title: 'Extended Lifecycle Event Updated',
        slug: 'extended-lifecycle-event-open',
        status: 'open',
        allow_upload: true,
      }),
    )
    expect(patchRes.status).toBe(200)
    expect(mocks.state.events.get(eventId)?.slug).toBe('extended-lifecycle-event-open')
    expect(mocks.state.events.get(eventId)?.status).toBe('open')

    const getRes = await getEventBySlug(
      jsonRequest('GET', 'http://localhost/api/admin/events?slug=extended-lifecycle-event-open'),
    )
    const getBody = await getRes.json()
    expect(getRes.status).toBe(200)
    expect(getBody.data.event.id).toBe(eventId)

    const uploadRes = await uploadFiles(uploadRequest(eventId))
    const uploadBody = await uploadRes.json()
    const postId = uploadBody.data.posts[0].id as string

    expect(uploadRes.status).toBe(200)
    expect(mocks.state.posts.has(postId)).toBe(true)

    const deletePostRes = await managePost(
      jsonRequest('POST', 'http://localhost/api/admin/posts', {
        postId,
        action: 'delete',
      }),
    )
    expect(deletePostRes.status).toBe(200)
    expect(mocks.state.posts.has(postId)).toBe(false)
    expect(mocks.adminStorageRemove).toHaveBeenCalled()
    expect(mocks.logPostDeletion).toHaveBeenCalledTimes(1)

    const deleteEventRes = await deleteEvent(
      jsonRequest('DELETE', `http://localhost/api/admin/events?id=${eventId}`),
    )
    expect(deleteEventRes.status).toBe(200)
    expect(mocks.logEventDeletion).toHaveBeenCalledTimes(1)

    const getAfterDeleteRes = await getEventBySlug(
      jsonRequest('GET', 'http://localhost/api/admin/events?slug=extended-lifecycle-event-open'),
    )
    expect(getAfterDeleteRes.status).toBe(404)
  })

  it('blocks slug collision when editing event slug', async () => {
    const firstEvent = await createEvent(
      jsonRequest('POST', 'http://localhost/api/admin/events', {
        title: 'First Event',
        slug: 'slug-first',
        event_date: '2026-07-01T00:00:00.000Z',
        start_date: '2026-07-01T08:00:00.000Z',
        status: 'open',
      }),
    )
    const secondEvent = await createEvent(
      jsonRequest('POST', 'http://localhost/api/admin/events', {
        title: 'Second Event',
        slug: 'slug-second',
        event_date: '2026-07-02T00:00:00.000Z',
        start_date: '2026-07-02T08:00:00.000Z',
        status: 'open',
      }),
    )
    const firstBody = await firstEvent.json()
    const secondBody = await secondEvent.json()

    const updateRes = await updateEvent(
      jsonRequest('PATCH', 'http://localhost/api/admin/events', {
        id: secondBody.data.event.id,
        slug: firstBody.data.event.slug,
      }),
    )
    const updateBody = await updateRes.json()

    expect(updateRes.status).toBe(400)
    expect(updateBody.success).toBe(false)
    expect(updateBody.error).toContain('Slug already exists')
  })
})
