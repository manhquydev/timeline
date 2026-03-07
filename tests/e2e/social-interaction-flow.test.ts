import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const state = {
    post: {
      id: 'post_1',
      event_id: 'evt_social',
      user_id: 'owner_1',
    } as any,
    likes: new Set<string>(),
    comments: new Map<string, any>(),
    notifications: [] as any[],
    broadcasts: [] as Array<{ channel: string; payload: any }>,
    commentSeq: 0,
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
    findById: vi.fn(async (postId: string) => (postId === state.post.id ? state.post : null)),
  }

  const likeRepository = {
    hasUserLiked: vi.fn(async (userId: string, postId: string) => {
      if (postId !== state.post.id) return false
      return state.likes.has(userId)
    }),
    addLike: vi.fn(async (userId: string, postId: string, eventId: string) => {
      state.likes.add(userId)
      return { userId, postId, eventId }
    }),
    removeLike: vi.fn(async (userId: string, postId: string) => {
      if (postId !== state.post.id) return false
      return state.likes.delete(userId)
    }),
    getLikeCount: vi.fn(async (postId: string) => {
      if (postId !== state.post.id) return 0
      return state.likes.size
    }),
  }

  const commentRepository = {
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

  const createSupabaseClient = vi.fn(() => ({
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

  return {
    state,
    authState,
    postRepository,
    likeRepository,
    commentRepository,
    notificationRepository,
    createSupabaseClient,
  }
})

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mocks.createSupabaseClient()),
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

import { GET as getLikeState, POST as toggleLike } from '@/app/api/posts/[postId]/like/route'
import { POST as addComment } from '@/app/api/posts/[postId]/comments/route'
import { PUT as updateComment, DELETE as removeComment } from '@/app/api/comments/[commentId]/route'

function request(method: string, url: string, body?: Record<string, unknown>) {
  return new Request(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

function postParams(postId = 'post_1') {
  return { params: Promise.resolve({ postId }) } as any
}

function commentParams(commentId: string) {
  return { params: Promise.resolve({ commentId }) } as any
}

describe('E2E API Flow - User social interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.state.likes.clear()
    mocks.state.comments.clear()
    mocks.state.notifications = []
    mocks.state.broadcasts = []
    mocks.state.commentSeq = 0

    mocks.authState.user = {
      id: 'user_actor',
      email: 'actor@example.com',
      user_metadata: {
        full_name: 'Actor User',
        avatar_url: null,
      },
    }
    mocks.authState.error = null
  })

  it('covers like -> unlike -> comment -> edit comment -> delete comment', async () => {
    const likeRes = await toggleLike(
      request('POST', 'http://localhost/api/posts/post_1/like'),
      postParams('post_1'),
    )
    const likeBody = await likeRes.json()
    expect(likeRes.status).toBe(200)
    expect(likeBody.success).toBe(true)
    expect(likeBody.data.liked).toBe(true)
    expect(mocks.state.likes.size).toBe(1)

    const unlikeRes = await toggleLike(
      request('POST', 'http://localhost/api/posts/post_1/like'),
      postParams('post_1'),
    )
    const unlikeBody = await unlikeRes.json()
    expect(unlikeRes.status).toBe(200)
    expect(unlikeBody.data.liked).toBe(false)
    expect(mocks.state.likes.size).toBe(0)

    const likeStateRes = await getLikeState(
      request('GET', 'http://localhost/api/posts/post_1/like'),
      postParams('post_1'),
    )
    const likeStateBody = await likeStateRes.json()
    expect(likeStateRes.status).toBe(200)
    expect(likeStateBody.data.count).toBe(0)
    expect(likeStateBody.data.hasLiked).toBe(false)

    const commentRes = await addComment(
      request('POST', 'http://localhost/api/posts/post_1/comments', {
        content: 'Great memory!',
      }),
      postParams('post_1'),
    )
    const commentBody = await commentRes.json()
    const commentId = commentBody.data._id as string

    expect(commentRes.status).toBe(200)
    expect(commentBody.success).toBe(true)
    expect(commentId).toBe('comment_1')
    expect(mocks.state.comments.size).toBe(1)

    const editRes = await updateComment(
      request('PUT', `http://localhost/api/comments/${commentId}`, {
        content: 'Great memory, updated!',
      }),
      commentParams(commentId),
    )
    const editBody = await editRes.json()

    expect(editRes.status).toBe(200)
    expect(editBody.success).toBe(true)
    expect(editBody.data.comment.content).toBe('Great memory, updated!')

    const deleteRes = await removeComment(
      request('DELETE', `http://localhost/api/comments/${commentId}`),
      commentParams(commentId),
    )
    const deleteBody = await deleteRes.json()

    expect(deleteRes.status).toBe(200)
    expect(deleteBody.success).toBe(true)
    expect(mocks.state.comments.size).toBe(0)

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

  it('returns unauthorized for protected actions when not logged in', async () => {
    mocks.authState.user = null
    mocks.authState.error = null

    const likeRes = await toggleLike(
      request('POST', 'http://localhost/api/posts/post_1/like'),
      postParams('post_1'),
    )
    const commentRes = await addComment(
      request('POST', 'http://localhost/api/posts/post_1/comments', {
        content: 'Should fail',
      }),
      postParams('post_1'),
    )

    expect(likeRes.status).toBe(401)
    expect(commentRes.status).toBe(401)
  })
})
