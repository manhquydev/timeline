import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/mongodb/repositories', () => ({
  eventRepository: { findById: vi.fn() },
  postRepository: { create: vi.fn() },
}))
vi.mock('@/lib/mongodb/utils/stats-updater', () => ({
  updateEventStats: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('sharp', () => {
  const makeChain = () => {
    const chain: any = {
      rotate: vi.fn(),
      resize: vi.fn(),
      webp: vi.fn(),
      ensureAlpha: vi.fn(),
      raw: vi.fn(),
      metadata: vi.fn().mockResolvedValue({ width: 800, height: 600 }),
      toBuffer: vi.fn(),
    }
    chain.rotate.mockReturnValue(chain)
    chain.resize.mockReturnValue(chain)
    chain.webp.mockReturnValue(chain)
    chain.ensureAlpha.mockReturnValue(chain)
    chain.raw.mockReturnValue(chain)
    chain.toBuffer.mockImplementation(async (opts?: any) => {
      if (opts?.resolveWithObject) {
        return { data: Buffer.alloc(32 * 32 * 4, 128), info: { width: 32, height: 32 } }
      }
      return Buffer.from([0xFF, 0xD8, 0xFF])
    })
    return chain
  }
  return { default: vi.fn(() => makeChain()) }
})
vi.mock('blurhash', () => ({
  encode: vi.fn().mockReturnValue('LGF5]+Yk^6#M@-5c,1J5@[or[Q6.'),
}))
vi.mock('nanoid', () => ({ nanoid: vi.fn().mockReturnValue('test-id-123') }))
vi.mock('@/lib/security/file-validation', () => ({
  validateUploadedFile: vi.fn().mockResolvedValue({ valid: true }),
}))
vi.mock('@/lib/logger', () => ({
  uploadLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
  apiLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { createClient } from '@/lib/supabase/server'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'
import { validateUploadedFile } from '@/lib/security/file-validation'
import { POST } from '@/app/api/upload/route'

const JPEG_BYTES = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, ...Array(20).fill(0)])
const VALID_JPEG = new File([JPEG_BYTES], 'photo.jpg', { type: 'image/jpeg' })
if (typeof (VALID_JPEG as any).arrayBuffer !== 'function') {
  Object.defineProperty(VALID_JPEG, 'arrayBuffer', {
    value: async () => JPEG_BYTES.buffer,
  })
}

/** Build a NextRequest whose formData() resolves immediately — avoids JSDOM stream hang */
function makeRequest(fields: { eventId?: string; wishText?: string; files?: File[] } = {}) {
  const fd = new FormData()
  fd.append('eventId', fields.eventId ?? 'event-1')
  fd.append('wishText', fields.wishText ?? 'Hello!')
  for (const file of fields.files ?? [VALID_JPEG]) {
    if (typeof (file as any).arrayBuffer !== 'function') {
      Object.defineProperty(file, 'arrayBuffer', {
        value: async () => JPEG_BYTES.buffer,
      })
    }
    fd.append('files', file)
  }
  const req = new NextRequest('http://localhost/api/upload', { method: 'POST' })
  vi.spyOn(req, 'formData').mockResolvedValue(fd)
  return req
}

function makeNoFilesRequest() {
  const fd = new FormData()
  fd.append('eventId', 'event-1')
  fd.append('wishText', 'test')
  const req = new NextRequest('http://localhost/api/upload', { method: 'POST' })
  vi.spyOn(req, 'formData').mockResolvedValue(fd)
  return req
}

const makeAuthClient = (
  profile: { display_name: string | null; full_name: string | null; email: string | null } = {
    display_name: null,
    full_name: 'Test User',
    email: 'user@test.com',
  },
  user: any = { id: 'user-1', email: 'user@test.com' }
) => ({
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: profile, error: null }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'mock' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.test/img.jpg' } }),
    }),
  },
})

const openEvent = { id: 'event-1', status: 'open', allow_upload: true }

async function runUploadAndGetCreateArg(
  profile: { display_name: string | null; full_name: string | null; email: string | null }
) {
  vi.mocked(createClient).mockResolvedValue(makeAuthClient(profile) as any)
  vi.mocked(eventRepository.findById).mockResolvedValue(openEvent as any)
  vi.mocked(validateUploadedFile).mockResolvedValue({ valid: true } as any)
  vi.mocked(postRepository.create).mockImplementation(async (payload: any) => ({ id: 'p1', ...payload }))

  const res = await POST(makeRequest())
  expect(res.status).toBe(200)
  return vi.mocked(postRepository.create).mock.calls[0]?.[0]
}


describe('POST /api/upload — authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateUploadedFile).mockResolvedValue({ valid: true } as any)
  })

  it('returns 401 for unauthenticated request', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)

    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })
})

describe('POST /api/upload — event validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateUploadedFile).mockResolvedValue({ valid: true } as any)
  })

  it('returns 404 when event does not exist', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthClient() as any)
    vi.mocked(eventRepository.findById).mockResolvedValue(null)

    const res = await POST(makeRequest())
    expect(res.status).toBe(404)
  })

  it('returns 403 when event is closed', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthClient() as any)
    vi.mocked(eventRepository.findById).mockResolvedValue({
      id: 'event-1', status: 'closed', allow_upload: true,
    } as any)

    const res = await POST(makeRequest())
    expect(res.status).toBe(403)
  })

  it('returns 403 when event disallows uploads', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthClient() as any)
    vi.mocked(eventRepository.findById).mockResolvedValue({
      id: 'event-1', status: 'open', allow_upload: false,
    } as any)

    const res = await POST(makeRequest())
    expect(res.status).toBe(403)
  })
})

describe('POST /api/upload — file validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateUploadedFile).mockResolvedValue({ valid: true } as any)
  })

  it('returns 500 when all files are invalid', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthClient() as any)
    vi.mocked(eventRepository.findById).mockResolvedValue(openEvent as any)
    vi.mocked(validateUploadedFile).mockResolvedValue({ valid: false, error: 'Bad type' })

    const res = await POST(makeRequest())
    // BUG: invalid files silently skipped — 200 with empty posts array misleads client
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('No files were successfully uploaded')
  })

  it('returns 400 when no files are attached', async () => {
    vi.mocked(createClient).mockResolvedValue(makeAuthClient() as any)
    const res = await POST(makeNoFilesRequest())
    expect(res.status).toBe(400)
  })
})

describe('POST /api/upload — display name priority', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateUploadedFile).mockResolvedValue({ valid: true } as any)
  })

  it('uses display_name when available', async () => {
    const callArg = await runUploadAndGetCreateArg({
      display_name: 'MyNickname',
      full_name: 'Real Name',
      email: 'u@test.com',
    })
    expect(callArg?.user_name).toBe('MyNickname')
  })

  it('falls back to full_name when display_name is null', async () => {
    const callArg = await runUploadAndGetCreateArg({
      display_name: null,
      full_name: 'Real Name',
      email: 'u@test.com',
    })
    expect(callArg?.user_name).toBe('Real Name')
  })

  it('falls back to email prefix when display_name and full_name are null', async () => {
    const callArg = await runUploadAndGetCreateArg({
      display_name: null,
      full_name: null,
      email: 'minhquan@test.com',
    })
    expect(callArg?.user_name).toBe('minhquan')
  })

  it('falls back to Anonymous when all profile fields are null', async () => {
    const callArg = await runUploadAndGetCreateArg({
      display_name: null,
      full_name: null,
      email: null,
    })
    expect(callArg?.user_name).toBe('Anonymous')
  })
})

describe('POST /api/upload — Supabase storage failure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateUploadedFile).mockResolvedValue({ valid: true } as any)
  })

  it('handles storage upload error without crashing the server', async () => {
    const clientStorageFail = makeAuthClient()
    vi.mocked(clientStorageFail.storage.from).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: { message: 'bucket full' } }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
    } as any)
    vi.mocked(createClient).mockResolvedValue(clientStorageFail as any)
    vi.mocked(eventRepository.findById).mockResolvedValue(openEvent as any)

    const res = await POST(makeRequest())
    expect(res.status).toBeLessThan(600)
  })
})
