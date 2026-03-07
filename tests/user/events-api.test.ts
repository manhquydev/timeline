import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/mongodb/repositories', () => ({
  postRepository: {
    findWithCursor: vi.fn(),
  },
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('@/lib/supabase/profile-utils', () => ({
  enrichPostsWithDisplayNames: vi.fn().mockImplementation(async (posts: any[]) => posts),
}))
vi.mock('@/lib/mongodb/repositories/LikeRepository', () => ({
  likeRepository: {
    hasUserLiked: vi.fn().mockResolvedValue(false),
  },
}))
vi.mock('@/lib/logger', () => ({
  apiLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { createClient } from '@/lib/supabase/server'
import { postRepository } from '@/lib/mongodb/repositories'
import { GET } from '@/app/api/events/[eventId]/posts/route'

const makeRequest = (eventId: string, params?: Record<string, string>) => {
  const url = new URL(`http://localhost/api/events/${eventId}/posts`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  return new NextRequest(url)
}

const makeRouteParams = (eventId: string) =>
  ({ params: Promise.resolve({ eventId }) }) as any

const mockPost = (overrides = {}) => ({
  id: 'post-1',
  event_id: 'event-1',
  user_id: 'user-1',
  media_type: 'image',
  media_url: 'https://cdn.test/img.jpg',
  thumbnail_url: 'https://cdn.test/thumb.jpg',
  blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
  dimensions: { width: 800, height: 600 },
  file_size: 102400,
  wish_text: 'Happy day!',
  uploaded_at: new Date('2024-01-01T00:00:00Z'),
  view_count: 5,
  status: 'approved',
  user_name: 'Test User',
  likes_count: 2,
  comments_count: 1,
  ...overrides,
})

describe('GET /api/events/[eventId]/posts — basic', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with approved posts for the event', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({
      posts: [mockPost()],
      nextCursor: null,
    } as any)

    const res = await GET(makeRequest('event-1'), makeRouteParams('event-1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.posts).toHaveLength(1)
  })

  it('returns empty array when event has no posts', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({
      posts: [],
      nextCursor: null,
    } as any)

    const res = await GET(makeRequest('event-empty'), makeRouteParams('event-empty'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.posts).toEqual([])
  })

  it('always fetches only "approved" status for public access', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({ posts: [], nextCursor: null } as any)

    await GET(makeRequest('event-1'), makeRouteParams('event-1'))

    const callArgs = vi.mocked(postRepository.findWithCursor).mock.calls[0]
    // 4th argument should be 'approved' status
    expect(callArgs[3]).toBe('approved')
  })
})

describe('GET /api/events/[eventId]/posts — pagination', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes limit param to repository', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({ posts: [], nextCursor: null } as any)

    await GET(makeRequest('event-1', { limit: '5' }), makeRouteParams('event-1'))

    const callArgs = vi.mocked(postRepository.findWithCursor).mock.calls[0]
    expect(callArgs[1]).toBe(5) // limit
  })

  it('returns nextCursor when more posts exist', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({
      posts: [mockPost()],
      nextCursor: 'cursor-abc',
    } as any)

    const res = await GET(makeRequest('event-1'), makeRouteParams('event-1'))
    const body = await res.json()
    expect(body.nextCursor).toBe('cursor-abc')
  })

  it('defaults limit to 20 when not specified', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({ posts: [], nextCursor: null } as any)

    await GET(makeRequest('event-1'), makeRouteParams('event-1'))
    const callArgs = vi.mocked(postRepository.findWithCursor).mock.calls[0]
    expect(callArgs[1]).toBe(20)
  })
})

describe('GET /api/events/[eventId]/posts — authenticated user', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sets current_user_liked when user is logged in', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } }, error: null,
        }),
      },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({
      posts: [mockPost()],
      nextCursor: null,
    } as any)

    const { likeRepository } = await import('@/lib/mongodb/repositories/LikeRepository')
    vi.mocked(likeRepository.hasUserLiked).mockResolvedValue(true)

    const res = await GET(makeRequest('event-1'), makeRouteParams('event-1'))
    const body = await res.json()
    expect(body.posts[0].current_user_liked).toBe(true)
  })

  it('sets current_user_liked to false for guests', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({
      posts: [mockPost()],
      nextCursor: null,
    } as any)

    const res = await GET(makeRequest('event-1'), makeRouteParams('event-1'))
    const body = await res.json()
    expect(body.posts[0].current_user_liked).toBe(false)
  })
})

describe('GET /api/events/[eventId]/posts — response shape', () => {
  beforeEach(() => vi.clearAllMocks())

  it('serializes uploaded_at as ISO string', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({
      posts: [mockPost({ uploaded_at: new Date('2024-06-15T12:00:00Z') })],
      nextCursor: null,
    } as any)

    const res = await GET(makeRequest('event-1'), makeRouteParams('event-1'))
    const body = await res.json()
    expect(body.posts[0].uploaded_at).toBe('2024-06-15T12:00:00.000Z')
  })

  it('maps null optional fields correctly', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any)
    vi.mocked(postRepository.findWithCursor).mockResolvedValue({
      posts: [mockPost({ thumbnail_url: undefined, blurhash: undefined, wish_text: undefined })],
      nextCursor: null,
    } as any)

    const res = await GET(makeRequest('event-1'), makeRouteParams('event-1'))
    const body = await res.json()
    const post = body.posts[0]
    expect(post.thumbnail_url).toBeNull()
    expect(post.blurhash).toBeNull()
    expect(post.wish_text).toBeNull()
  })
})
