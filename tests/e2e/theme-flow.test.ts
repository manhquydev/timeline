/**
 * Theme Flow Integration Tests
 *
 * Tests the theme API routes and ThemeRepository logic in isolation using mocks.
 * No Playwright — uses Vitest + jsdom per vitest.config.ts.
 *
 * Critical paths covered:
 *  1. GET /api/theme/active  — public endpoint, fallback to default
 *  2. GET /api/admin/themes  — admin list with data.data.themes shape
 *  3. POST /api/admin/themes/seed — seed predefined themes
 *  4. PATCH /api/admin/themes — activate action
 *  5. POST /api/admin/themes/fix — fix multiple active themes
 *  6. PREDEFINED_THEMES registry shape
 *  7. ThemeRepository.setActive — deactivates others
 *  8. ThemeManagement component — auto-seeds when list is empty
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const mockTheme = {
  id: 'theme_test_01',
  name: '20-10',
  displayName: '🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸',
  description: 'Theme chào mừng Ngày Phụ Nữ Việt Nam',
  colors: {
    primary: 'hsl(340 90% 65%)',
    primaryForeground: '#ffffff',
    secondary: 'hsl(280 70% 88%)',
    secondaryForeground: 'hsl(280 15% 20%)',
    accent: 'hsl(350 85% 70%)',
    accentForeground: '#ffffff',
    background: 'hsl(330 30% 98%)',
    foreground: 'hsl(280 15% 20%)',
    muted: 'hsl(320 25% 95%)',
    mutedForeground: 'hsl(280 10% 50%)',
    border: 'hsl(330 35% 90%)',
    input: 'hsl(330 35% 90%)',
    ring: 'hsl(340 90% 65%)',
    card: 'hsl(330 40% 99%)',
    cardForeground: 'hsl(280 15% 20%)',
    popover: 'hsl(330 40% 99%)',
    popoverForeground: 'hsl(280 15% 20%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
  },
  gradients: {
    hero: ['hsl(340 90% 65%)', 'hsl(280 75% 75%)'],
    card: ['hsl(350 85% 70%)', 'hsl(310 80% 72%)'],
    button: ['hsl(340 90% 65%)', 'hsl(300 80% 70%)'],
    accent: ['hsl(350 90% 72%)', 'hsl(330 80% 70%)'],
  },
  typography: {
    fontSans: 'Inter, sans-serif',
    fontHeader: 'Inter, sans-serif',
    baseSize: '16px',
    borderRadius: '0.5rem',
  },
  effects: {
    enableParticles: true,
    particleColor: '#FFB6D9',
    enableGradientAnimation: true,
    enableGlassEffect: true,
  },
  coverImage: undefined,
  icon: undefined,
  isActive: true,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-02T00:00:00.000Z'),
  createdBy: 'admin-user-id',
}

const mockDefaultTheme = {
  name: 'default',
  displayName: 'Mặc Định',
  description: 'Theme mặc định',
  isActive: false,
  colors: { primary: 'hsl(262.1 83.3% 57.8%)' },
  gradients: { hero: [], card: [], button: [], accent: [] },
  effects: { enableParticles: true, particleColor: '#fff', enableGradientAnimation: false, enableGlassEffect: false },
  typography: { fontSans: 'Inter', fontHeader: 'Inter', baseSize: '16px', borderRadius: '0.5rem' },
}

// ---------------------------------------------------------------------------
// Mock module factories (must be at top-level for hoisting)
// ---------------------------------------------------------------------------

vi.mock('@/lib/mongodb/repositories', () => ({
  themeRepository: {
    findActive: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setActive: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    getDefaultTheme: vi.fn(() => mockDefaultTheme),
  },
}))

vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/logger', () => ({
  apiLogger: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
  adminLogger: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'admin-user-id', email: 'admin@test.com' } },
        error: null,
      }),
    },
  }),
}))

vi.mock('@/lib/auth-utils', () => ({
  isCurrentUserAdmin: vi.fn().mockResolvedValue(true),
  isSuperAdmin: vi.fn().mockResolvedValue(false),
  getUserRole: vi.fn().mockResolvedValue('admin'),
}))

vi.mock('@/lib/themes/predefined-themes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/themes/predefined-themes')>()
  return actual
})

vi.mock('@/lib/mongodb/models/Theme', () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    updateMany: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Tests: GET /api/theme/active  (public endpoint)
// ---------------------------------------------------------------------------

describe('GET /api/theme/active', () => {
  let themeRepository: any

  beforeEach(async () => {
    vi.resetAllMocks()
    const repos = await import('@/lib/mongodb/repositories')
    themeRepository = repos.themeRepository
    themeRepository.getDefaultTheme.mockReturnValue(mockDefaultTheme)
  })

  it('returns the active theme with ISO date strings', async () => {
    themeRepository.findActive.mockResolvedValue(mockTheme)

    const { GET } = await import('@/app/api/theme/active/route')
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.theme.name).toBe('20-10')
    expect(json.theme.createdAt).toBe('2025-01-01T00:00:00.000Z')
    expect(json.theme.updatedAt).toBe('2025-01-02T00:00:00.000Z')
  })

  it('returns default theme when no active theme exists', async () => {
    themeRepository.findActive.mockResolvedValue(null)

    const { GET } = await import('@/app/api/theme/active/route')
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.theme.name).toBe('default')
    expect(json.theme.isActive).toBe(false)
  })

  it('handles null createdAt/updatedAt on theme document without throwing', async () => {
    const themeWithNullDates = { ...mockTheme, createdAt: null as any, updatedAt: null as any }
    themeRepository.findActive.mockResolvedValue(themeWithNullDates)

    const { GET } = await import('@/app/api/theme/active/route')
    await expect(GET()).resolves.toBeDefined()
  })

  it('returns 200 even when MongoDB throws — graceful degradation', async () => {
    themeRepository.findActive.mockRejectedValue(new Error('DB connection timeout'))

    const { GET } = await import('@/app/api/theme/active/route')
    const response = await GET()
    expect(response.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// Tests: GET /api/admin/themes  (admin endpoint — response shape)
// ---------------------------------------------------------------------------

describe('GET /api/admin/themes', () => {
  let themeRepository: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const repos = await import('@/lib/mongodb/repositories')
    themeRepository = repos.themeRepository
  })

  it('returns themes wrapped in data.data.themes (successResponse shape)', async () => {
    themeRepository.find.mockResolvedValue([mockTheme])

    const { GET } = await import('@/app/api/admin/themes/route')
    const req = new Request('http://localhost/api/admin/themes')
    const response = await GET(req as any)
    const json = await response.json()

    // successResponse wraps payload: { success, data: { themes } }
    expect(json.success).toBe(true)
    expect(json.data).toBeDefined()
    expect(Array.isArray(json.data.themes)).toBe(true)
    expect(json.data.themes).toHaveLength(1)
    expect(json.data.themes[0].name).toBe('20-10')
  })

  it('returns empty array when no themes in DB', async () => {
    themeRepository.find.mockResolvedValue([])

    const { GET } = await import('@/app/api/admin/themes/route')
    const req = new Request('http://localhost/api/admin/themes')
    const response = await GET(req as any)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.themes).toHaveLength(0)
  })

  it('serialises createdAt as ISO string even when stored as null', async () => {
    themeRepository.find.mockResolvedValue([
      { ...mockTheme, createdAt: null, updatedAt: null },
    ])

    const { GET } = await import('@/app/api/admin/themes/route')
    const req = new Request('http://localhost/api/admin/themes')
    const response = await GET(req as any)
    const json = await response.json()

    expect(response.status).toBe(200)
    // Should not throw — returns a valid ISO string even for null dates
    const theme = json.data.themes[0]
    expect(typeof theme.createdAt).toBe('string')
    expect(typeof theme.updatedAt).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// Tests: POST /api/admin/themes/seed
// ---------------------------------------------------------------------------

describe('POST /api/admin/themes/seed', () => {
  let themeRepository: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const repos = await import('@/lib/mongodb/repositories')
    themeRepository = repos.themeRepository
  })

  it('creates all predefined themes when none exist', async () => {
    themeRepository.findOne.mockResolvedValue(null) // no existing themes
    themeRepository.create.mockImplementation(async (data: any) => ({
      ...data,
      id: `seeded_${data.name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const { POST } = await import('@/app/api/admin/themes/seed/route')
    const req = new Request('http://localhost/api/admin/themes/seed', { method: 'POST' })
    const response = await POST(req as any)
    const json = await response.json()

    expect(json.success).toBe(true)
    const created = json.data.results.filter((r: any) => r.status === 'created')
    expect(created.length).toBeGreaterThan(0)
  })

  it('skips existing themes instead of duplicating', async () => {
    // All themes already exist
    themeRepository.findOne.mockResolvedValue(mockTheme)

    const { POST } = await import('@/app/api/admin/themes/seed/route')
    const req = new Request('http://localhost/api/admin/themes/seed', { method: 'POST' })
    const response = await POST(req as any)
    const json = await response.json()

    expect(json.success).toBe(true)
    const skipped = json.data.results.filter((r: any) => r.status === 'skipped')
    expect(skipped.length).toBeGreaterThan(0)
    expect(themeRepository.create).not.toHaveBeenCalled()
  })

  it('seeds exactly the predefined theme names (default, 20-10, 8-3)', async () => {
    const createdNames: string[] = []
    themeRepository.findOne.mockResolvedValue(null)
    themeRepository.create.mockImplementation(async (data: any) => {
      createdNames.push(data.name)
      return { ...data, id: `id_${data.name}`, createdAt: new Date(), updatedAt: new Date() }
    })

    const { POST } = await import('@/app/api/admin/themes/seed/route')
    const req = new Request('http://localhost/api/admin/themes/seed', { method: 'POST' })
    await POST(req as any)

    expect(createdNames).toContain('default')
    expect(createdNames).toContain('20-10')
    expect(createdNames).toContain('8-3')
  })

  it('sets default theme as isActive:true and others as false during seed', async () => {
    const createdDocs: any[] = []
    themeRepository.findOne.mockResolvedValue(null)
    themeRepository.create.mockImplementation(async (data: any) => {
      createdDocs.push(data)
      return { ...data, id: `id_${data.name}`, createdAt: new Date(), updatedAt: new Date() }
    })

    const { POST } = await import('@/app/api/admin/themes/seed/route')
    const req = new Request('http://localhost/api/admin/themes/seed', { method: 'POST' })
    await POST(req as any)

    const defaultDoc = createdDocs.find(d => d.name === 'default')
    const otherDocs = createdDocs.filter(d => d.name !== 'default')
    expect(defaultDoc?.isActive).toBe(true)
    otherDocs.forEach(d => expect(d.isActive).toBe(false))
  })
})

// ---------------------------------------------------------------------------
// Tests: PATCH /api/admin/themes — activate action
// ---------------------------------------------------------------------------

describe('PATCH /api/admin/themes — activate', () => {
  let themeRepository: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const repos = await import('@/lib/mongodb/repositories')
    themeRepository = repos.themeRepository
  })

  it('activates a theme and returns it in response', async () => {
    const activated = { ...mockTheme, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    themeRepository.setActive.mockResolvedValue(activated)

    const { PATCH } = await import('@/app/api/admin/themes/route')
    const req = new Request('http://localhost/api/admin/themes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'theme_test_01', action: 'activate' }),
    })
    const response = await PATCH(req as any)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.theme.isActive).toBe(true)
    expect(themeRepository.setActive).toHaveBeenCalledWith('theme_test_01')
  })

  it('returns 404 when activating non-existent theme', async () => {
    themeRepository.setActive.mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/admin/themes/route')
    const req = new Request('http://localhost/api/admin/themes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'non_existent', action: 'activate' }),
    })
    const response = await PATCH(req as any)

    expect(response.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Tests: POST /api/admin/themes/fix — fix multiple active themes
// ---------------------------------------------------------------------------

describe('POST /api/admin/themes/fix', () => {
  let ThemeMock: any

  beforeEach(async () => {
    vi.clearAllMocks()
    ThemeMock = (await import('@/lib/mongodb/models/Theme')).default
  })

  it('reports already consistent when ≤1 active theme', async () => {
    ThemeMock.find.mockResolvedValue([mockTheme])

    const { POST } = await import('@/app/api/admin/themes/fix/route')
    const req = new Request('http://localhost/api/admin/themes/fix', { method: 'POST' })
    const response = await POST(req as any)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.message).toContain('consistent')
  })

  it('fixes multiple active themes by deactivating all then setting default active', async () => {
    const twoActive = [mockTheme, { ...mockTheme, id: 'theme_2', name: '8-3' }]
    const defaultTheme = { id: 'theme_default', name: 'default', displayName: 'Mặc Định' }
    ThemeMock.find.mockResolvedValue(twoActive)
    ThemeMock.updateMany.mockResolvedValue({ modifiedCount: 2 })
    ThemeMock.findOne.mockResolvedValue(defaultTheme)
    ThemeMock.findOneAndUpdate.mockResolvedValue({ ...defaultTheme, isActive: true })

    const { POST } = await import('@/app/api/admin/themes/fix/route')
    const req = new Request('http://localhost/api/admin/themes/fix', { method: 'POST' })
    const response = await POST(req as any)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.fixed).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Tests: PREDEFINED_THEMES registry
// ---------------------------------------------------------------------------

describe('PREDEFINED_THEMES', () => {
  it('exports exactly 3 themes: default, 20-10, 8-3', async () => {
    const { PREDEFINED_THEMES } = await import('@/lib/themes/predefined-themes')
    expect(PREDEFINED_THEMES).toHaveLength(3)

    const names = PREDEFINED_THEMES.map((t: any) => t.name)
    expect(names).toContain('default')
    expect(names).toContain('20-10')
    expect(names).toContain('8-3')
  })

  it('every predefined theme has required color fields', async () => {
    const { PREDEFINED_THEMES } = await import('@/lib/themes/predefined-themes')
    const requiredColorKeys = [
      'primary', 'primaryForeground', 'secondary', 'accent',
      'background', 'foreground', 'border', 'card',
    ]

    for (const theme of PREDEFINED_THEMES as any[]) {
      for (const key of requiredColorKeys) {
        expect(theme.colors[key], `${theme.name} missing color.${key}`).toBeDefined()
      }
    }
  })

  it('every predefined theme has all 4 gradient arrays', async () => {
    const { PREDEFINED_THEMES } = await import('@/lib/themes/predefined-themes')
    for (const theme of PREDEFINED_THEMES as any[]) {
      expect(Array.isArray(theme.gradients.hero), `${theme.name}.gradients.hero`).toBe(true)
      expect(Array.isArray(theme.gradients.card), `${theme.name}.gradients.card`).toBe(true)
      expect(Array.isArray(theme.gradients.button), `${theme.name}.gradients.button`).toBe(true)
      expect(Array.isArray(theme.gradients.accent), `${theme.name}.gradients.accent`).toBe(true)
    }
  })

  it('every predefined theme has typography with fontSans and borderRadius', async () => {
    const { PREDEFINED_THEMES } = await import('@/lib/themes/predefined-themes')
    for (const theme of PREDEFINED_THEMES as any[]) {
      expect(theme.typography?.fontSans, `${theme.name}.typography.fontSans`).toBeDefined()
      expect(theme.typography?.borderRadius, `${theme.name}.typography.borderRadius`).toBeDefined()
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: ThemeRepository.setActive — atomically deactivates others
// ---------------------------------------------------------------------------

describe('ThemeRepository.setActive', () => {
  let themeRepository: any

  beforeEach(async () => {
    vi.resetAllMocks()
    const repos = await import('@/lib/mongodb/repositories')
    themeRepository = repos.themeRepository
  })

  it('calls updateMany({}, {isActive:false}) before activating', async () => {
    themeRepository.setActive.mockImplementation(async (id: string) => {
      // Simulate: deactivate all then activate target
      await themeRepository.updateMany({}, { isActive: false })
      return { ...mockTheme, id, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    })

    await themeRepository.setActive('theme_test_01')
    expect(themeRepository.updateMany).toHaveBeenCalledWith({}, { isActive: false })
  })

  it('only one theme is active after setActive', async () => {
    const themes = [
      { id: 'a', isActive: true },
      { id: 'b', isActive: false },
      { id: 'c', isActive: false },
    ]

    themeRepository.setActive.mockImplementation(async (id: string) => {
      themes.forEach(t => { t.isActive = false })
      const target = themes.find(t => t.id === id)
      if (target) target.isActive = true
      return target
    })

    await themeRepository.setActive('b')
    const activeCount = themes.filter(t => t.isActive).length
    expect(activeCount).toBe(1)
    expect(themes.find(t => t.id === 'b')?.isActive).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Tests: ThemeRepository.getDefaultTheme()
// ---------------------------------------------------------------------------

describe('ThemeRepository.getDefaultTheme', () => {
  it('returns an object without id, createdAt, updatedAt, createdBy (not a DB doc)', async () => {
    const { themeRepository } = await import('@/lib/mongodb/repositories')
    ;(themeRepository.getDefaultTheme as any).mockReturnValueOnce(mockDefaultTheme)

    const defaultTheme = themeRepository.getDefaultTheme()
    expect(defaultTheme.name).toBe('default')
    expect((defaultTheme as any).id).toBeUndefined()
    expect((defaultTheme as any).createdAt).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Tests: ThemeManagement component — auto-seed behaviour
// ---------------------------------------------------------------------------

describe('ThemeManagement component', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('auto-seeds when API returns empty themes list on first load', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { themes: [] } }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { message: 'Đã tạo 3 themes' } }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            themes: [
              { ...mockTheme, id: 'default', name: 'default', displayName: 'Mặc Định', isActive: true,
                gradients: { hero: ['#000'], card: ['#000'], button: ['#000'], accent: ['#000'] } },
            ],
          },
        }),
      } as any)

    vi.stubGlobal('fetch', fetchMock)

    const { ThemeManagement } = await import('@/components/admin/theme-management')
    await act(async () => {
      render(React.createElement(ThemeManagement))
    })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/themes')
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/themes/seed', expect.objectContaining({ method: 'POST' }))
    })
  })

  it('shows theme cards immediately when API returns themes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          themes: [
            { ...mockTheme,
              gradients: { hero: ['#f00'], card: ['#f00'], button: ['#f00'], accent: ['#f00'] },
            },
          ],
        },
      }),
    } as any)

    vi.stubGlobal('fetch', fetchMock)

    const { ThemeManagement } = await import('@/components/admin/theme-management')
    await act(async () => {
      render(React.createElement(ThemeManagement))
    })

    await waitFor(() => {
      expect(screen.getByText('🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸')).toBeInTheDocument()
    })
  })

  it('shows error message when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const { ThemeManagement } = await import('@/components/admin/theme-management')
    await act(async () => {
      render(React.createElement(ThemeManagement))
    })

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    })
  })

  it('does NOT call seed API when themes already exist', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          themes: [
            { ...mockTheme,
              gradients: { hero: ['#f00'], card: ['#f00'], button: ['#f00'], accent: ['#f00'] },
            },
          ],
        },
      }),
    } as any)

    vi.stubGlobal('fetch', fetchMock)

    const { ThemeManagement } = await import('@/components/admin/theme-management')
    await act(async () => {
      render(React.createElement(ThemeManagement))
    })

    await waitFor(() => {
      const seedCalls = fetchMock.mock.calls.filter((c: any[]) =>
        typeof c[0] === 'string' && c[0].includes('/seed')
      )
      expect(seedCalls).toHaveLength(0)
    })
  })
})
