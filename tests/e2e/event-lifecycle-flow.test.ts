import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const state = {
    events: new Map<string, any>(),
    posts: [] as any[],
  }

  const authState = {
    user: { id: 'user_flow', email: 'user-flow@example.com' } as any,
  }

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
      const post = { id: `post_${state.posts.length + 1}`, ...data }
      state.posts.push(post)
      return post
    }),
    deleteByEvent: vi.fn(async (eventId: string) => {
      const before = state.posts.length
      state.posts = state.posts.filter((post) => post.event_id !== eventId)
      return before - state.posts.length
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
    eventRepository,
    postRepository,
    logEventCreation: vi.fn(),
    logEventDeletion: vi.fn(),
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
        handler(request, { user: mocks.adminUser, supabase: {}, request }),
  }
})

vi.mock('@/lib/mongodb/repositories', () => ({
  eventRepository: mocks.eventRepository,
  postRepository: mocks.postRepository,
}))

vi.mock('@/lib/services/audit-service', () => ({
  logEventCreation: mocks.logEventCreation,
  logEventDeletion: mocks.logEventDeletion,
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
  POST as createEvent,
  PATCH as updateEvent,
  DELETE as deleteEvent,
} from '@/app/api/admin/events/route'
import { POST as uploadFiles } from '@/app/api/upload/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Build upload request mock with pre-resolved formData() to avoid the Node.js
 * multipart stream parsing hang caused by new NextRequest(..., { body: formData }).
 */
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

describe('E2E API Flow - Admin Event Lifecycle with User Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.events.clear()
    mocks.state.posts = []
    mocks.authState.user = { id: 'user_flow', email: 'user-flow@example.com' }
  })

  it('covers create -> upload blocked -> open -> upload success -> delete -> upload 404', async () => {
    const createRes = await createEvent(
      jsonRequest('POST', 'http://localhost/api/admin/events', {
        title: 'Lifecycle Event',
        slug: 'lifecycle-event',
        event_date: '2026-05-01T00:00:00.000Z',
        start_date: '2026-05-01T08:00:00.000Z',
        end_date: '2026-05-01T11:00:00.000Z',
        status: 'draft',
        allow_upload: true,
      }),
    )
    const createBody = await createRes.json()
    const eventId = createBody.data.event.id as string

    expect(createRes.status).toBe(200)
    expect(mocks.logEventCreation).toHaveBeenCalledTimes(1)
    expect(mocks.state.events.get(eventId)?.status).toBe('draft')

    const blockedUploadRes = await uploadFiles(uploadRequest(eventId))
    expect(blockedUploadRes.status).toBe(403)

    const openRes = await updateEvent(
      jsonRequest('PATCH', 'http://localhost/api/admin/events', {
        id: eventId,
        status: 'open',
        allow_upload: true,
      }),
    )
    expect(openRes.status).toBe(200)
    expect(mocks.state.events.get(eventId)?.status).toBe('open')

    const uploadOkRes = await uploadFiles(uploadRequest(eventId))
    const uploadBody = await uploadOkRes.json()
    expect(uploadOkRes.status).toBe(200)
    expect(uploadBody.data.posts).toHaveLength(1)
    expect(mocks.updateEventStats).toHaveBeenCalledWith(eventId)

    const deleteRes = await deleteEvent(
      jsonRequest('DELETE', `http://localhost/api/admin/events?id=${eventId}`),
    )
    const deleteBody = await deleteRes.json()

    expect(deleteRes.status).toBe(200)
    expect(deleteBody.data.deletedPostsCount).toBe(1)
    expect(mocks.logEventDeletion).toHaveBeenCalledTimes(1)

    const uploadAfterDeleteRes = await uploadFiles(uploadRequest(eventId))
    expect(uploadAfterDeleteRes.status).toBe(404)
  })
})
