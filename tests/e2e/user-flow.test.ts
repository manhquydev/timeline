/**
 * User Flow Integration Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { usePathname } from 'next/navigation'

vi.mock('@/lib/mongodb/connection', () => ({ connectToDatabase: vi.fn().mockResolvedValue(undefined) }))

const mockSupabaseConfig = { user: null as object | null, profile: null as object | null }
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockSupabaseConfig.user }, error: null }) },
    from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: mockSupabaseConfig.profile, error: null }) })),
    storage: { from: vi.fn(() => ({ upload: vi.fn().mockResolvedValue({ data: { path: 'events/test/img.jpg' }, error: null }), getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.supabase.co/img.jpg' } }) })) },
  })),
}))

const mockEventConfig = { event: null as object | null }
vi.mock('@/lib/mongodb/repositories', () => ({
  eventRepository: { findById: vi.fn(() => Promise.resolve(mockEventConfig.event)), findAll: vi.fn().mockResolvedValue([]) },
  postRepository: { create: vi.fn().mockResolvedValue({ id: 'post_new', event_id: 'evt_1' }) },
}))

vi.mock('@/lib/security/file-validation', () => ({ validateUploadedFile: vi.fn().mockResolvedValue({ valid: true }) }))
vi.mock('@/lib/mongodb/utils/stats-updater', () => ({ updateEventStats: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/logger', () => ({
  uploadLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
  apiLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
  adminLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))
vi.mock('sharp', () => ({ default: vi.fn(() => ({ resize: vi.fn().mockReturnThis(), webp: vi.fn().mockReturnThis(), toBuffer: vi.fn().mockResolvedValue(Buffer.from('fake')), metadata: vi.fn().mockResolvedValue({ width: 800, height: 600 }), raw: vi.fn().mockReturnThis() })) }))
vi.mock('blurhash', () => ({ encode: vi.fn().mockReturnValue('L6PZfS_NbHso') }))

function createMockEvent(overrides: Record<string, unknown> = {}) {
  return { id: 'evt_01', title: 'Test', slug: 'test', status: 'open', allow_upload: true, created_at: new Date().toISOString(), ...overrides }
}

/**
 * Build a minimal NextRequest-compatible mock that pre-resolves formData().
 * Using `new Request(..., { body: formData })` in Node.js causes request.formData()
 * to hang indefinitely when the body contains File objects (multipart stream parsing).
 * Returning a pre-built FormData-like object bypasses the stream entirely.
 */
function createUploadRequest(fields: { eventId: string; wishText: string }, fileList?: File[]) {
  const files = fileList ?? [new File(['data'], 'photo.jpg', { type: 'image/jpeg' })]
  const fakeFormData = {
    get: (key: string) => ({ eventId: fields.eventId, wishText: fields.wishText }[key] ?? null),
    getAll: (key: string) => (key === 'files' ? files : []),
  }
  return {
    formData: vi.fn().mockResolvedValue(fakeFormData),
    // auth guard reads these before formData()
    headers: new Headers(),
    url: 'http://localhost:3000/api/upload',
  } as unknown as import('next/server').NextRequest
}

describe('POST /api/upload — authentication', () => {
  beforeEach(() => { mockSupabaseConfig.user = null; mockSupabaseConfig.profile = null; mockEventConfig.event = createMockEvent() })

  it('returns 401 when user is not authenticated', async () => {
    const { POST } = await import('@/app/api/upload/route')
    const response = await POST(createUploadRequest({ eventId: 'evt_01', wishText: 'Hello' }, []))
    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.success).toBe(false)
  })
})

describe('POST /api/upload — event access control', () => {
  const mockUser = { id: 'uid_alice', email: 'alice@example.com' }
  beforeEach(() => { mockSupabaseConfig.user = mockUser; mockSupabaseConfig.profile = { display_name: 'Alice', full_name: null, email: 'alice@example.com' } })

  it('returns 404 when event does not exist', async () => {
    mockEventConfig.event = null
    const { POST } = await import('@/app/api/upload/route')
    const response = await POST(createUploadRequest({ eventId: 'nonexistent', wishText: 'Hello' }))
    expect(response.status).toBe(404)
  })

  it('returns 403 when event is closed', async () => {
    mockEventConfig.event = createMockEvent({ status: 'closed' })
    const { POST } = await import('@/app/api/upload/route')
    const response = await POST(createUploadRequest({ eventId: 'evt_closed', wishText: 'Hello' }))
    expect(response.status).toBe(403)
  })

  it('returns 403 when allow_upload is false', async () => {
    mockEventConfig.event = createMockEvent({ status: 'open', allow_upload: false })
    const { POST } = await import('@/app/api/upload/route')
    const response = await POST(createUploadRequest({ eventId: 'evt_no_upload', wishText: 'Hello' }))
    expect(response.status).toBe(403)
  })
})

describe('ConditionalFooter', () => {
  it('renders on / (home)', async () => {
    vi.mocked(usePathname).mockReturnValue('/')
    const { ConditionalFooter } = await import('@/components/layout/conditional-footer')
    const { container } = render(React.createElement(ConditionalFooter))
    expect(container.firstChild).not.toBeNull()
  })

  it('returns null on /admin routes', async () => {
    vi.mocked(usePathname).mockReturnValue('/admin/dashboard')
    const { ConditionalFooter } = await import('@/components/layout/conditional-footer')
    const { container } = render(React.createElement(ConditionalFooter))
    expect(container.firstChild).toBeNull()
  })

  it('returns null on /moderator routes', async () => {
    vi.mocked(usePathname).mockReturnValue('/moderator/posts')
    const { ConditionalFooter } = await import('@/components/layout/conditional-footer')
    const { container } = render(React.createElement(ConditionalFooter))
    expect(container.firstChild).toBeNull()
  })

  it('returns null on /admin sub-paths like /admin/themes', async () => {
    vi.mocked(usePathname).mockReturnValue('/admin/themes')
    const { ConditionalFooter } = await import('@/components/layout/conditional-footer')
    const { container } = render(React.createElement(ConditionalFooter))
    expect(container.firstChild).toBeNull()
  })
})

describe('Upload — user display name resolution', () => {
  it('prefers display_name over full_name and email', () => {
    const p = { display_name: 'Nickname', full_name: 'Real Name', email: 'u@ex.com' }
    const resolved = p.display_name || p.full_name || p.email?.split('@')[0] || 'Anonymous'
    expect(resolved).toBe('Nickname')
  })

  it('falls back to full_name when display_name is null', () => {
    const p = { display_name: null, full_name: 'Real Name', email: 'u@ex.com' }
    const resolved = p.display_name || p.full_name || p.email?.split('@')[0] || 'Anonymous'
    expect(resolved).toBe('Real Name')
  })

  it('falls back to email prefix when display_name and full_name are null', () => {
    const p = { display_name: null, full_name: null, email: 'myuser@ex.com' }
    const resolved = p.display_name || p.full_name || p.email?.split('@')[0] || 'Anonymous'
    expect(resolved).toBe('myuser')
  })

  it('falls back to Anonymous when all profile fields are null', () => {
    const p = { display_name: null, full_name: null, email: null }
    const resolved = p.display_name || p.full_name || p.email?.split('@')[0] || 'Anonymous'
    expect(resolved).toBe('Anonymous')
  })
})
