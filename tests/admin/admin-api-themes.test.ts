import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/mongodb/connection', () => ({ connectToDatabase: vi.fn() }))
vi.mock('@/lib/logger', () => ({
  adminLogger: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
  apiLogger: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}))

// vi.hoisted ensures these are available when vi.mock factories run
const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    setActive: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/mongodb/repositories', () => ({
  themeRepository: mockRepo,
}))

// Auth mocks — these control withAdmin gate
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}))
vi.mock('@/lib/auth-utils', () => ({
  isCurrentUserAdmin: vi.fn(),
  isSuperAdmin: vi.fn().mockResolvedValue(false),
  getUserRole: vi.fn().mockResolvedValue('admin'),
}))

import { GET, PATCH } from '@/app/api/admin/themes/route'
import { POST as seedPOST } from '@/app/api/admin/themes/seed/route'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase/server'
import { PREDEFINED_THEMES } from '@/lib/themes/predefined-themes'

// Alias for clarity in tests
const mockThemeRepository = mockRepo

const adminUser = { id: 'admin-id', email: 'admin@test.com' }

function makeMockSupabase(user: typeof adminUser | null = adminUser) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    from: vi.fn(),
  }
}

function makeRequest(url = 'http://localhost/api/admin/themes', init?: RequestInit) {
  return new NextRequest(url, init)
}

describe('GET /api/admin/themes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase() as any)
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(true)
  })

  it('returns 401 for unauthenticated requests', async () => {
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase(null) as any)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it('returns 403 for non-admin users', async () => {
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(false)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('returns themes list for admin', async () => {
    const mockThemes = [
      { id: 'theme-1', name: 'default', displayName: 'Default', isActive: true,
        createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
        colors: {}, gradients: {}, effects: {} },
    ]
    mockRepo.find.mockResolvedValue(mockThemes)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.themes).toHaveLength(1)
    expect(body.data.themes[0].name).toBe('default')
  })

  it('does NOT throw when theme.createdAt is null (null-date bug)', async () => {
    // Bug: calling .toISOString() on null would throw — ensure the guard works
    const mockThemes = [
      { id: 'theme-1', name: 'default', displayName: 'Default', isActive: false,
        createdAt: null, updatedAt: null, colors: {}, gradients: {}, effects: {} },
    ]
    mockRepo.find.mockResolvedValue(mockThemes)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    // createdAt fallback should be a valid ISO string
    expect(() => new Date(body.data.themes[0].createdAt)).not.toThrow()
  })

  it('returns empty themes array when DB has no themes', async () => {
    mockRepo.find.mockResolvedValue([])

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.themes).toEqual([])
  })
})

describe('POST /api/admin/themes/seed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase() as any)
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(true)
    mockRepo.findOne.mockResolvedValue(null)
    mockRepo.create.mockImplementation(async (data: any) => ({
      ...data, id: `created-${data.name}`,
    }))
  })

  it('returns 401 for unauthenticated seed request', async () => {
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase(null) as any)

    const res = await seedPOST(makeRequest('http://localhost/api/admin/themes/seed', { method: 'POST' }))

    expect(res.status).toBe(401)
  })

  it('creates all predefined themes when DB is empty', async () => {
    const res = await seedPOST(makeRequest('http://localhost/api/admin/themes/seed', { method: 'POST' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.results.filter((r: any) => r.status === 'created')).toHaveLength(
      PREDEFINED_THEMES.length
    )
  })

  it('skips themes that already exist', async () => {
    // All themes already exist
    mockRepo.findOne.mockResolvedValue({ name: 'existing' })

    const res = await seedPOST(makeRequest('http://localhost/api/admin/themes/seed', { method: 'POST' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.results.every((r: any) => r.status === 'skipped')).toBe(true)
    expect(mockRepo.create).not.toHaveBeenCalled()
  })

  it('sets the default theme as active during seed', async () => {
    await seedPOST(makeRequest('http://localhost/api/admin/themes/seed', { method: 'POST' }))

    const createCalls = mockRepo.create.mock.calls
    const defaultCall = createCalls.find(([data]: any[]) => data.name === 'default')

    expect(defaultCall).toBeDefined()
    expect(defaultCall![0].isActive).toBe(true)

    // Non-default themes should not be active
    const otherCalls = createCalls.filter(([data]: any[]) => data.name !== 'default')
    otherCalls.forEach(([data]: any[]) => {
      expect(data.isActive).toBe(false)
    })
  })
})

describe('PATCH /api/admin/themes (activate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase() as any)
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(true)
  })

  it('returns 403 for non-admin on PATCH', async () => {
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(false)

    const req = makeRequest('http://localhost/api/admin/themes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'theme-1', action: 'activate' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PATCH(req)
    expect(res.status).toBe(403)
  })

  it('calls setActive when action is "activate"', async () => {
    const activatedTheme = {
      id: 'theme-1', name: 'default', displayName: 'Default', isActive: true,
      createdAt: new Date(), updatedAt: new Date(),
      colors: {}, gradients: {}, effects: {},
    }
    mockRepo.setActive.mockResolvedValue(activatedTheme)

    const req = makeRequest('http://localhost/api/admin/themes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'theme-1', action: 'activate' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PATCH(req)

    expect(mockRepo.setActive).toHaveBeenCalledWith('theme-1')
    expect(res.status).toBe(200)
  })

  it('returns 404 when theme not found', async () => {
    mockRepo.setActive.mockResolvedValue(null)

    const req = makeRequest('http://localhost/api/admin/themes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'nonexistent', action: 'activate' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PATCH(req)

    expect(res.status).toBe(404)
  })
})
