import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/mongodb/repositories', () => ({
  postRepository: {
    findById: vi.fn(),
  },
  likeRepository: {
    hasUserLiked: vi.fn(),
  },
}))

vi.mock('@/lib/supabase/profile-utils', () => ({
  enrichPostsWithDisplayNames: vi.fn(async (posts: any[]) => posts),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user_1' } },
      }),
    },
  }),
}))

import { likeRepository, postRepository } from '@/lib/mongodb/repositories'
import { GET } from '@/app/api/events/[eventId]/posts/[postId]/route'

describe('GET /api/events/[eventId]/posts/[postId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns mapped approved post and liked state', async () => {
    vi.mocked(postRepository.findById).mockResolvedValue({
      id: 'post_1',
      event_id: 'evt_1',
      media_type: 'image',
      media_url: 'https://cdn.test/photo.jpg',
      thumbnail_url: 'https://cdn.test/thumb.jpg',
      blurhash: null,
      dimensions: { width: 1000, height: 700 },
      file_size: 12345,
      wish_text: 'Lời chúc từ bài đăng',
      uploaded_at: new Date('2026-03-07T10:00:00.000Z'),
      view_count: 2,
      status: 'approved',
      user_id: 'user_2',
      user_name: 'Hà',
      likes_count: 5,
      comments_count: 1,
    } as any)
    vi.mocked(likeRepository.hasUserLiked).mockResolvedValue(true)

    const res = await GET(
      new Request('http://localhost/api/events/evt_1/posts/post_1'),
      { params: Promise.resolve({ eventId: 'evt_1', postId: 'post_1' }) }
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.post.id).toBe('post_1')
    expect(body.post.current_user_liked).toBe(true)
  })

  it('returns 404 when post not found or not approved', async () => {
    vi.mocked(postRepository.findById).mockResolvedValue({
      id: 'post_2',
      event_id: 'evt_1',
      status: 'pending',
    } as any)

    const res = await GET(
      new Request('http://localhost/api/events/evt_1/posts/post_2'),
      { params: Promise.resolve({ eventId: 'evt_1', postId: 'post_2' }) }
    )

    expect(res.status).toBe(404)
  })
})

