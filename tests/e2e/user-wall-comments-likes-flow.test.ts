import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const state = {
    profiles: new Map<string, { display_name: string; avatar_url: string | null }>(),
    posts: [] as any[],
    likes: new Map<string, Set<string>>(),
    likeEntries: [] as any[],
    comments: new Map<string, any>(),
    commentSeq: 0,
    notifications: [] as any[],
    broadcasts: [] as Array<{ channel: string; payload: any }>,
  }

  const authState = {
    user: {
      id: 'user_actor',
      email: 'actor@example.com',
      user_metadata: {
        full_name: 'Actor User',
        avatar_url: null,
      },
    } as any,
    error: null as any,
  }

  const postRepository = {
    findByUser: vi.fn(async (userId: string) => state.posts.filter((p) => p.user_id === userId)),
    findById: vi.fn(async (postId: string) => state.posts.find((p) => p.id === postId) || null),
  }

  const likeRepository = {
    hasUserLiked: vi.fn(async (userId: string, postId: string) => {
      const set = state.likes.get(postId)
      return !!set?.has(userId)
    }),
    addLike: vi.fn(async (userId: string, postId: string, eventId: string) => {
      if (!state.likes.has(postId)) state.likes.set(postId, new Set())
      state.likes.get(postId)!.add(userId)
      state.likeEntries.push({ id: `like_${state.likeEntries.length + 1}`, user_id: userId, post_id: postId, event_id: eventId })
      return { userId, postId, eventId }
    }),
    removeLike: vi.fn(async (userId: string, postId: string) => {
      const set = state.likes.get(postId)
      if (!set) return false
      const removed = set.delete(userId)
      if (removed) {
        state.likeEntries = state.likeEntries.filter((entry) => !(entry.user_id === userId && entry.post_id === postId))
      }
      return removed
    }),
    getLikeCount: vi.fn(async (postId: string) => state.likes.get(postId)?.size || 0),
    getLikesByPost: vi.fn(async (postId: string, limit: number, offset: number) =>
      state.likeEntries.filter((entry) => entry.post_id === postId).slice(offset, offset + limit),
    ),
  }

  const commentRepository = {
    getCommentsByPost: vi.fn(async (postId: string, limit: number, offset: number) =>
      Array.from(state.comments.values()).filter((c) => c.postId === postId).slice(offset, offset + limit),
    ),
    countComments: vi.fn(async (postId: string) =>
      Array.from(state.comments.values()).filter((c) => c.postId === postId).length,
    ),
    createComment: vi.fn(async (userId: string, postId: string, content: string, eventId: string, parentCommentId?: string) => {
      state.commentSeq += 1
      const comment = {
        _id: `comment_${state.commentSeq}`,
        postId,
        eventId,
        userId,
        content,
        parentCommentId: parentCommentId || null,
      }
      state.comments.set(comment._id, comment)
      return comment
    }),
    updateComment: vi.fn(async (commentId: string, content: string, userId: string) => {
      const existing = state.comments.get(commentId)
      if (!existing || existing.userId !== userId) return null
      const updated = { ...existing, content }
      state.comments.set(commentId, updated)
      return updated
    }),
    deleteComment: vi.fn(async (commentId: string, userId: string) => {
      const existing = state.comments.get(commentId)
      if (!existing || existing.userId !== userId) return false
      state.comments.delete(commentId)
      return true
    }),
  }

  const notificationRepository = {
    create: vi.fn(async (payload: any) => {
      state.notifications.push(payload)
      return payload
    }),
  }

  const createServerClient = vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authState.user },
        error: authState.error,
      }),
    },
    channel: vi.fn((channelName: string) => ({
      send: vi.fn(async (payload: any) => {
        state.broadcasts.push({ channel: channelName, payload })
        return { error: null }
      }),
    })),
  }))

  const createClient = vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn((_: string, userId: string) => ({
        maybeSingle: vi.fn().mockResolvedValue({
          data: state.profiles.get(userId) || null,
          error: null,
        }),
      })),
    })),
  }))

  return {
    state,
    authState,
    postRepository,
    likeRepository,
    commentRepository,
    notificationRepository,
    createServerClient,
    createClient,
  }
})

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mocks.createServerClient()),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/mongodb/repositories', () => ({
  postRepository: mocks.postRepository,
  likeRepository: mocks.likeRepository,
  commentRepository: mocks.commentRepository,
  notificationRepository: mocks.notificationRepository,
}))

vi.mock('@/lib/mongodb/repositories/PostRepository', () => ({
  postRepository: mocks.postRepository,
}))

vi.mock('@/lib/mongodb/models', () => ({
  NotificationType: {
    POST_LIKE: 'post_like',
    POST_COMMENT: 'post_comment',
  },
}))

import { GET as getWall } from '@/app/api/wall/[userId]/route'
import { GET as getLikeState, POST as toggleLike } from '@/app/api/posts/[postId]/like/route'
import { GET as listLikes } from '@/app/api/posts/[postId]/likes/route'
import { GET as getComments, POST as addComment } from '@/app/api/posts/[postId]/comments/route'
import { PUT as editComment, DELETE as deleteComment } from '@/app/api/comments/[commentId]/route'

function request(method: string, url: string, body?: Record<string, unknown>) {
  return new Request(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

function nextRequest(url: string) {
  return new NextRequest(url)
}

function postParams(postId = 'post_approved') {
  return { params: Promise.resolve({ postId }) } as any
}

function wallParams(userId = 'user_owner') {
  return { params: Promise.resolve({ userId }) } as any
}

function commentParams(commentId: string) {
  return { params: Promise.resolve({ commentId }) } as any
}

describe('E2E API Flow - Wall, comments, likes', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.authState.user = {
      id: 'user_actor',
      email: 'actor@example.com',
      user_metadata: {
        full_name: 'Actor User',
        avatar_url: null,
      },
    }
    mocks.authState.error = null

    mocks.state.profiles = new Map([
      ['user_owner', { display_name: 'Owner User', avatar_url: 'https://cdn.test/avatar-owner.webp' }],
    ])

    mocks.state.posts = [
      {
        id: 'post_approved',
        event_id: 'evt_wall',
        user_id: 'user_owner',
        media_type: 'image',
        media_url: 'https://cdn.test/p-approved.webp',
        thumbnail_url: 'https://cdn.test/p-approved-thumb.webp',
        blurhash: 'L6PZfS_NbHso00xtofWB00bcVst7',
        dimensions: { width: 1200, height: 800 },
        file_size: 1024,
        wish_text: 'Approved post',
        uploaded_at: new Date('2026-01-01T00:00:00.000Z'),
        view_count: 0,
        status: 'approved',
        user_name: 'Owner User',
      },
      {
        id: 'post_pending',
        event_id: 'evt_wall',
        user_id: 'user_owner',
        media_type: 'image',
        media_url: 'https://cdn.test/p-pending.webp',
        thumbnail_url: 'https://cdn.test/p-pending-thumb.webp',
        blurhash: 'L6PZfS_NbHso00xtofWB00bcVst7',
        dimensions: { width: 1200, height: 800 },
        file_size: 1024,
        wish_text: 'Pending post',
        uploaded_at: new Date('2026-01-02T00:00:00.000Z'),
        view_count: 0,
        status: 'pending',
        user_name: 'Owner User',
      },
    ]

    mocks.state.likes = new Map()
    mocks.state.likeEntries = []
    mocks.state.comments = new Map()
    mocks.state.commentSeq = 0
    mocks.state.notifications = []
    mocks.state.broadcasts = []
  })

  it('covers wall view + like/unlike + comment create/edit/delete + list likes/comments', async () => {
    const wallRes = await getWall(
      nextRequest('http://localhost/api/wall/user_owner'),
      wallParams('user_owner'),
    )
    const wallBody = await wallRes.json()
    expect(wallRes.status).toBe(200)
    expect(wallBody.total).toBe(1)
    expect(wallBody.posts[0].id).toBe('post_approved')

    const likeRes = await toggleLike(
      request('POST', 'http://localhost/api/posts/post_approved/like'),
      postParams('post_approved'),
    )
    const likeBody = await likeRes.json()
    expect(likeRes.status).toBe(200)
    expect(likeBody.data.liked).toBe(true)

    const likeStateRes = await getLikeState(
      request('GET', 'http://localhost/api/posts/post_approved/like'),
      postParams('post_approved'),
    )
    const likeStateBody = await likeStateRes.json()
    expect(likeStateRes.status).toBe(200)
    expect(likeStateBody.data.count).toBe(1)
    expect(likeStateBody.data.hasLiked).toBe(true)

    const likesListRes = await listLikes(
      request('GET', 'http://localhost/api/posts/post_approved/likes?page=1&limit=20'),
      postParams('post_approved'),
    )
    const likesListBody = await likesListRes.json()
    expect(likesListRes.status).toBe(200)
    expect(likesListBody.likes).toHaveLength(1)

    const addCommentRes = await addComment(
      request('POST', 'http://localhost/api/posts/post_approved/comments', {
        content: 'Great shot!',
      }),
      postParams('post_approved'),
    )
    const addCommentBody = await addCommentRes.json()
    const commentId = addCommentBody.data._id as string
    expect(addCommentRes.status).toBe(200)
    expect(commentId).toBe('comment_1')

    const listCommentsRes = await getComments(
      request('GET', 'http://localhost/api/posts/post_approved/comments?page=1&limit=20'),
      postParams('post_approved'),
    )
    const listCommentsBody = await listCommentsRes.json()
    expect(listCommentsRes.status).toBe(200)
    expect(listCommentsBody.data.total).toBe(1)

    const editRes = await editComment(
      request('PUT', `http://localhost/api/comments/${commentId}`, {
        content: 'Great shot! Updated.',
      }),
      commentParams(commentId),
    )
    const editBody = await editRes.json()
    expect(editRes.status).toBe(200)
    expect(editBody.data.comment.content).toBe('Great shot! Updated.')

    const unlikeRes = await toggleLike(
      request('POST', 'http://localhost/api/posts/post_approved/like'),
      postParams('post_approved'),
    )
    const unlikeBody = await unlikeRes.json()
    expect(unlikeRes.status).toBe(200)
    expect(unlikeBody.data.liked).toBe(false)

    const deleteRes = await deleteComment(
      request('DELETE', `http://localhost/api/comments/${commentId}`),
      commentParams(commentId),
    )
    expect(deleteRes.status).toBe(200)

    const listAfterDeleteRes = await getComments(
      request('GET', 'http://localhost/api/posts/post_approved/comments?page=1&limit=20'),
      postParams('post_approved'),
    )
    const listAfterDeleteBody = await listAfterDeleteRes.json()
    expect(listAfterDeleteRes.status).toBe(200)
    expect(listAfterDeleteBody.data.total).toBe(0)

    expect(mocks.state.notifications).toHaveLength(2)
    expect(
      mocks.state.broadcasts.some((item) => item.payload?.payload?.type === 'post:like'),
    ).toBe(true)
    expect(
      mocks.state.broadcasts.some((item) => item.payload?.payload?.type === 'post:unlike'),
    ).toBe(true)
    expect(
      mocks.state.broadcasts.some((item) => item.payload?.payload?.type === 'comment:add'),
    ).toBe(true)
  })

  it('covers validation/auth/not-found paths', async () => {
    const wallMissingUserRes = await getWall(
      nextRequest('http://localhost/api/wall/'),
      wallParams(''),
    )
    expect(wallMissingUserRes.status).toBe(400)

    const invalidCommentRes = await addComment(
      request('POST', 'http://localhost/api/posts/post_approved/comments', {
        content: '',
      }),
      postParams('post_approved'),
    )
    expect(invalidCommentRes.status).toBe(400)

    mocks.authState.user = null
    mocks.authState.error = null

    const likeUnauthorized = await toggleLike(
      request('POST', 'http://localhost/api/posts/post_approved/like'),
      postParams('post_approved'),
    )
    const commentUnauthorized = await addComment(
      request('POST', 'http://localhost/api/posts/post_approved/comments', {
        content: 'Should fail',
      }),
      postParams('post_approved'),
    )

    expect(likeUnauthorized.status).toBe(401)
    expect(commentUnauthorized.status).toBe(401)

    mocks.authState.user = {
      id: 'user_actor',
      email: 'actor@example.com',
      user_metadata: { full_name: 'Actor User' },
    }

    mocks.state.posts = []
    const likeNotFound = await toggleLike(
      request('POST', 'http://localhost/api/posts/post_approved/like'),
      postParams('post_approved'),
    )
    expect(likeNotFound.status).toBe(404)
  })
})
