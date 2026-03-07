import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/mongodb/repositories', () => ({
  themeRepository: {
    findActive: vi.fn(),
    getDefaultTheme: vi.fn(),
  },
}))
vi.mock('@/lib/logger', () => ({
  apiLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { themeRepository } from '@/lib/mongodb/repositories'
import { GET } from '@/app/api/theme/active/route'

const mockActiveTheme = {
  id: 'theme-1',
  name: '20-10',
  displayName: '🌸 20/10',
  description: 'Women Day theme',
  colors: { primary: 'hsl(340 90% 65%)', secondary: 'hsl(280 70% 88%)' },
  typography: {},
  gradients: { hero: ['hsl(340 90% 65%)', 'hsl(280 70% 88%)'] },
  effects: { enableParticles: true, particleColor: '#FF69B4' },
  coverImage: null,
  icon: '🌸',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  createdBy: 'admin-id',
}

const mockDefaultTheme = {
  id: 'theme-default',
  name: 'default',
  displayName: 'Default',
  description: 'Default theme',
  colors: { primary: 'hsl(250 70% 60%)' },
  typography: {},
  gradients: {},
  effects: { enableParticles: false },
  isActive: false,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
}

describe('GET /api/theme/active — active theme exists', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with the active theme object', async () => {
    vi.mocked(themeRepository.findActive).mockResolvedValue(mockActiveTheme as any)

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.theme).toBeDefined()
    expect(body.theme.name).toBe('20-10')
    expect(body.theme.isActive).toBe(true)
  })

  it('serializes createdAt and updatedAt as ISO strings', async () => {
    vi.mocked(themeRepository.findActive).mockResolvedValue(mockActiveTheme as any)

    const res = await GET()
    const body = await res.json()
    expect(typeof body.theme.createdAt).toBe('string')
    expect(body.theme.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(typeof body.theme.updatedAt).toBe('string')
  })

  it('returns theme with colors and gradients', async () => {
    vi.mocked(themeRepository.findActive).mockResolvedValue(mockActiveTheme as any)

    const res = await GET()
    const body = await res.json()
    expect(body.theme.colors).toMatchObject({ primary: 'hsl(340 90% 65%)' })
    expect(body.theme.gradients.hero).toHaveLength(2)
  })
})

describe('GET /api/theme/active — no active theme', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns default theme when findActive returns null', async () => {
    vi.mocked(themeRepository.findActive).mockResolvedValue(null)
    vi.mocked(themeRepository.getDefaultTheme).mockReturnValue(mockDefaultTheme as any)

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.theme).toBeDefined()
    expect(body.theme.name).toBe('default')
  })

  it('calls getDefaultTheme() when no active theme found', async () => {
    vi.mocked(themeRepository.findActive).mockResolvedValue(null)
    vi.mocked(themeRepository.getDefaultTheme).mockReturnValue(mockDefaultTheme as any)

    await GET()
    expect(themeRepository.getDefaultTheme).toHaveBeenCalledOnce()
  })
})

describe('GET /api/theme/active — error handling', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 500 when database throws', async () => {
    vi.mocked(themeRepository.findActive).mockRejectedValue(new Error('MongoDB timeout'))

    const res = await GET()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('does not expose internal error details in response', async () => {
    vi.mocked(themeRepository.findActive).mockRejectedValue(new Error('connection string leaked'))

    const res = await GET()
    const body = await res.json()
    // Should not contain sensitive info
    expect(JSON.stringify(body)).not.toContain('connection string leaked')
  })
})
