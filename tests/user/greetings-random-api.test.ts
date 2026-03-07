import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/mongodb/repositories', () => ({
  greetingRepository: {
    findRandomByEventContext: vi.fn(),
  },
  postRepository: {
    findRandomApprovedWishByEvent: vi.fn(),
  },
}))

import { greetingRepository, postRepository } from '@/lib/mongodb/repositories'
import { GET } from '@/app/api/greetings/random/route'

describe('GET /api/greetings/random', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns event post wish with deep link when available', async () => {
    vi.mocked(postRepository.findRandomApprovedWishByEvent).mockResolvedValue({
      id: 'post_123',
      wish_text: 'Chúc mừng 8/3 từ ảnh sự kiện',
      user_name: 'Lan',
      thumbnail_url: 'https://cdn.test/thumb.jpg',
      media_url: 'https://cdn.test/media.jpg',
    } as any)
    vi.mocked(greetingRepository.findRandomByEventContext).mockResolvedValue(null as any)

    const res = await GET(new Request('http://localhost/api/greetings/random?tag=qtpn2026&eventId=evt_8_3&eventSlug=quoc-te-phu-nu-2026'))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.isFallback).toBe(false)
    expect(body.greeting.source).toBe('post_wish')
    expect(body.greeting.message).toBe('Chúc mừng 8/3 từ ảnh sự kiện')
    expect(body.greeting.deepLink).toBe('/events/quoc-te-phu-nu-2026?postId=post_123')
  })

  it('falls back to approved greeting when no post wish', async () => {
    vi.mocked(postRepository.findRandomApprovedWishByEvent).mockResolvedValue(null as any)
    vi.mocked(greetingRepository.findRandomByEventContext).mockResolvedValue({
      id: 'gr_01',
      message: 'Lời chúc đã duyệt',
      authorName: 'Minh',
      eventTag: 'qtpn2026',
      eventSlug: 'quoc-te-phu-nu-2026',
      templateId: 2,
    } as any)

    const res = await GET(new Request('http://localhost/api/greetings/random?tag=qtpn2026&eventId=evt_8_3&eventSlug=quoc-te-phu-nu-2026'))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.isFallback).toBe(false)
    expect(body.greeting.source).toBe('greeting')
    expect(body.greeting.deepLink).toBe('/events/quoc-te-phu-nu-2026?greetingId=gr_01#event-greeting-focus')
  })

  it('returns empty_event payload when event has no source data', async () => {
    vi.mocked(postRepository.findRandomApprovedWishByEvent).mockResolvedValue(null as any)
    vi.mocked(greetingRepository.findRandomByEventContext).mockResolvedValue(null as any)

    const res = await GET(new Request('http://localhost/api/greetings/random?tag=qtpn2026&eventId=evt_8_3&eventSlug=quoc-te-phu-nu-2026'))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.isFallback).toBe(true)
    expect(body.greeting.source).toBe('empty_event')
    expect(body.greeting.deepLink).toBe('/events/quoc-te-phu-nu-2026')
  })
})
