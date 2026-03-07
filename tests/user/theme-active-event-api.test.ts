import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/logger', () => ({
  apiLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

vi.mock('@/lib/mongodb/repositories', () => ({
  themeRepository: {
    findActive: vi.fn(),
  },
  eventRepository: {
    findActiveGreetingEventByTheme: vi.fn(),
    findLean: vi.fn(),
  },
}))

import { eventRepository, themeRepository } from '@/lib/mongodb/repositories'
import { GET } from '@/app/api/theme/active-event/route'

describe('GET /api/theme/active-event', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns NO_ACTIVE_THEME in debug mode when no active theme', async () => {
    vi.mocked(themeRepository.findActive).mockResolvedValue(null as any)

    const res = await GET(new Request('http://localhost/api/theme/active-event?debug=1'))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.event).toBeNull()
    expect(body.debug?.reason).toBe('NO_ACTIVE_THEME')
  })

  it('returns active event even when cardEffectType is null', async () => {
    vi.mocked(themeRepository.findActive).mockResolvedValue({
      id: 'theme-20-10',
      name: '20-10',
      effects: { cardEffectType: null },
    } as any)

    vi.mocked(eventRepository.findActiveGreetingEventByTheme).mockResolvedValue({
      id: 'event-1',
      title: 'Ngày Quốc tế Phụ nữ',
      slug: '8-3-2026',
      greeting_tag: '8-3',
      theme_id: 'theme-20-10',
    } as any)

    const res = await GET(new Request('http://localhost/api/theme/active-event'))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.event).toBeDefined()
    expect(body.event.eventTag).toBe('8-3')
    expect(body.event.themeId).toBe('theme-20-10')
    expect(eventRepository.findActiveGreetingEventByTheme).toHaveBeenCalledWith('theme-20-10', expect.any(Date))
  })

  it('returns null event in normal mode when no matching event', async () => {
    vi.mocked(themeRepository.findActive).mockResolvedValue({
      id: 'theme-20-10',
      name: '20-10',
      effects: { cardEffectType: null },
    } as any)
    vi.mocked(eventRepository.findActiveGreetingEventByTheme).mockResolvedValue(null as any)

    const res = await GET(new Request('http://localhost/api/theme/active-event'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.event).toBeNull()
    expect(body.debug).toBeUndefined()
  })
})

