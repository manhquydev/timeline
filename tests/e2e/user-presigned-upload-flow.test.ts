import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const authState = {
    user: { id: 'user_upload', email: 'upload@example.com' } as any,
  }

  const eventState = {
    event: { id: 'evt_open', status: 'open', allow_upload: true } as any,
  }

  const storageState = {
    failAtIndex: -1,
    calls: 0,
  }

  const eventRepository = {
    findById: vi.fn(async (_id: string) => eventState.event),
  }

  const createSignedUploadUrl = vi.fn(async (path: string) => {
    const index = storageState.calls
    storageState.calls += 1
    if (storageState.failAtIndex === index) {
      return { data: null, error: { message: 'signed-url-failed' } }
    }
    return {
      data: {
        signedUrl: `https://storage.test/upload/${encodeURIComponent(path)}`,
        token: `token_${index}`,
      },
      error: null,
    }
  })

  const createClient = vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: authState.user }, error: null }),
    },
    storage: {
      from: vi.fn(() => ({
        createSignedUploadUrl,
      })),
    },
  }))

  return {
    authState,
    eventState,
    storageState,
    eventRepository,
    createClient,
    createSignedUploadUrl,
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/mongodb/repositories', () => ({
  eventRepository: mocks.eventRepository,
}))

import { POST } from '@/app/api/upload/presigned/route'

function jsonRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/upload/presigned', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('E2E API Flow - Presigned upload URLs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authState.user = { id: 'user_upload', email: 'upload@example.com' }
    mocks.eventState.event = { id: 'evt_open', status: 'open', allow_upload: true }
    mocks.storageState.failAtIndex = -1
    mocks.storageState.calls = 0
  })

  it('returns presigned URLs for a valid upload request', async () => {
    const response = await POST(
      jsonRequest({
        eventId: 'evt_open',
        fileCount: 3,
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.uploadUrls).toHaveLength(3)
    expect(body.eventId).toBe('evt_open')
    expect(body.userId).toBe('user_upload')
    expect(body.uploadUrls[0].path).toContain('evt_open/user_upload/')
  })

  it('covers validation and access control error paths', async () => {
    mocks.authState.user = null
    const unauthorized = await POST(jsonRequest({ eventId: 'evt_open', fileCount: 1 }))
    expect(unauthorized.status).toBe(401)

    mocks.authState.user = { id: 'user_upload', email: 'upload@example.com' }
    const missing = await POST(jsonRequest({ eventId: 'evt_open' }))
    expect(missing.status).toBe(400)

    const tooMany = await POST(jsonRequest({ eventId: 'evt_open', fileCount: 999 }))
    const tooManyBody = await tooMany.json()
    expect(tooMany.status).toBe(400)
    expect(tooManyBody.code).toBe('TOO_MANY_FILES')

    mocks.eventState.event = null
    const notFound = await POST(jsonRequest({ eventId: 'evt_missing', fileCount: 1 }))
    expect(notFound.status).toBe(404)

    mocks.eventState.event = { id: 'evt_closed', status: 'closed', allow_upload: true }
    const closed = await POST(jsonRequest({ eventId: 'evt_closed', fileCount: 1 }))
    expect(closed.status).toBe(403)
  })

  it('returns 500 when signed URL generation fails mid-batch', async () => {
    mocks.eventState.event = { id: 'evt_open', status: 'open', allow_upload: true }
    mocks.storageState.failAtIndex = 1

    const response = await POST(
      jsonRequest({
        eventId: 'evt_open',
        fileCount: 3,
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toContain('signed-url-failed')
  })
})
