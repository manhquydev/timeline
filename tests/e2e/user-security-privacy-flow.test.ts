import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const state = {
    notifications: [] as Array<{ id: string; read: boolean; title: string; userId: string }>,
    posts: [] as any[],
    userLogs: [] as any[],
    auditWrites: [] as any[],
  }

  const authState = {
    user: {
      id: 'user_advanced',
      email: 'advanced@example.com',
      created_at: '2026-01-01T00:00:00.000Z',
      user_metadata: { full_name: 'Advanced User' },
    } as any,
    error: null as any,
  }

  const mfaState = {
    listData: { totp: [{ id: 'factor_1', status: 'verified' }] } as any,
    listError: null as string | null,
    enrollData: { id: 'factor_2', type: 'totp', totp: { qr_code: 'qr' } } as any,
    enrollError: null as string | null,
    verifyData: { verified: true } as any,
    verifyError: null as string | null,
  }

  const notificationRepository = {
    getNotifications: vi.fn(async (userId: string) =>
      state.notifications.filter((n) => n.userId === userId),
    ),
    getUnreadCount: vi.fn(async (userId: string) =>
      state.notifications.filter((n) => n.userId === userId && !n.read).length,
    ),
    markAllAsRead: vi.fn(async (userId: string) => {
      state.notifications = state.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n,
      )
      return { modifiedCount: 1 }
    }),
    markAsRead: vi.fn(async (notificationId: string) => {
      state.notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      )
      return true
    }),
  }

  const auditLogRepository = {
    getLogsByUser: vi.fn(async (_userId: string, _limit: number) => state.userLogs),
    log: vi.fn(async (entry: any) => {
      state.auditWrites.push(entry)
      return entry
    }),
  }

  const postRepository = {
    findAll: vi.fn(async (_filter: any) => state.posts),
  }

  const createServerClient = vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authState.user },
        error: authState.error,
      }),
      mfa: {
        listFactors: vi.fn().mockImplementation(async () => {
          if (mfaState.listError) return { data: null, error: { message: mfaState.listError } }
          return { data: mfaState.listData, error: null }
        }),
        enroll: vi.fn().mockImplementation(async () => {
          if (mfaState.enrollError) return { data: null, error: { message: mfaState.enrollError } }
          return { data: mfaState.enrollData, error: null }
        }),
        challengeAndVerify: vi.fn().mockImplementation(async () => {
          if (mfaState.verifyError) return { data: null, error: { message: mfaState.verifyError } }
          return { data: mfaState.verifyData, error: null }
        }),
      },
    },
  }))

  return {
    state,
    authState,
    mfaState,
    notificationRepository,
    auditLogRepository,
    postRepository,
    createServerClient,
  }
})

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mocks.createServerClient()),
}))

vi.mock('@/lib/mongodb/repositories', () => ({
  notificationRepository: mocks.notificationRepository,
  auditLogRepository: mocks.auditLogRepository,
  postRepository: mocks.postRepository,
  eventRepository: {
    findById: vi.fn(),
    findAll: vi.fn(),
  },
}))

vi.mock('@/lib/mongodb/repositories/AuditLogRepository', () => ({
  auditLogRepository: mocks.auditLogRepository,
}))

vi.mock('@/lib/mongodb/models', () => ({
  AuditAction: {
    DATA_EXPORT: 'data_export',
    ACCOUNT_DELETION: 'account_deletion',
    MFA_ENROLLED: 'mfa_enrolled',
  },
}))

import { GET as getNotifications, PATCH as patchNotifications } from '@/app/api/notifications/route'
import { POST as exportData } from '@/app/api/auth/gdpr/export/route'
import { POST as deleteAccount } from '@/app/api/auth/gdpr/delete-account/route'
import { GET as listMfaFactors } from '@/app/api/auth/mfa/factors/route'
import { POST as enrollMfa } from '@/app/api/auth/mfa/enroll/route'
import { POST as verifyMfa } from '@/app/api/auth/mfa/verify/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new Request(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('E2E API Flow - Advanced user security/privacy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authState.user = {
      id: 'user_advanced',
      email: 'advanced@example.com',
      created_at: '2026-01-01T00:00:00.000Z',
      user_metadata: { full_name: 'Advanced User' },
    }
    mocks.authState.error = null
    mocks.mfaState.listError = null
    mocks.mfaState.enrollError = null
    mocks.mfaState.verifyError = null

    mocks.state.notifications = [
      { id: 'n1', read: false, title: 'New Like', userId: 'user_advanced' },
      { id: 'n2', read: false, title: 'New Comment', userId: 'user_advanced' },
    ]
    mocks.state.posts = [
      {
        id: 'post_1',
        wish_text: 'A memory',
        uploaded_at: '2026-02-01T00:00:00.000Z',
        media_url: 'https://cdn.test/p1.webp',
        thumbnail_url: 'https://cdn.test/p1_thumb.webp',
      },
    ]
    mocks.state.userLogs = [
      {
        action: 'post_created',
        timestamp: '2026-02-02T00:00:00.000Z',
        details: { postId: 'post_1' },
      },
    ]
    mocks.state.auditWrites = []
  })

  it('covers notifications + MFA + GDPR export/delete flows', async () => {
    const notifRes = await getNotifications()
    const notifBody = await notifRes.json()
    expect(notifRes.status).toBe(200)
    expect(notifBody.notifications).toHaveLength(2)
    expect(notifBody.unreadCount).toBe(2)

    const markOneRes = await patchNotifications(
      jsonRequest('PATCH', 'http://localhost/api/notifications', { notificationId: 'n1' }),
    )
    expect(markOneRes.status).toBe(200)

    const markAllRes = await patchNotifications(
      jsonRequest('PATCH', 'http://localhost/api/notifications', { markAll: true }),
    )
    expect(markAllRes.status).toBe(200)
    expect(mocks.state.notifications.every((n) => n.read)).toBe(true)

    const factorsRes = await listMfaFactors()
    const factorsBody = await factorsRes.json()
    expect(factorsRes.status).toBe(200)
    expect(factorsBody.totp).toHaveLength(1)

    const enrollRes = await enrollMfa(jsonRequest('POST', 'http://localhost/api/auth/mfa/enroll'))
    const enrollBody = await enrollRes.json()
    expect(enrollRes.status).toBe(200)
    expect(enrollBody.id).toBe('factor_2')

    const verifyRes = await verifyMfa(
      jsonRequest('POST', 'http://localhost/api/auth/mfa/verify', {
        factorId: 'factor_2',
        code: '123456',
      }),
    )
    const verifyBody = await verifyRes.json()
    expect(verifyRes.status).toBe(200)
    expect(verifyBody.verified).toBe(true)

    const exportRes = await exportData()
    const exportBody = await exportRes.json()
    expect(exportRes.status).toBe(200)
    expect(exportBody.profile.id).toBe('user_advanced')
    expect(exportBody.content.posts).toHaveLength(1)
    expect(exportBody.activity).toHaveLength(1)
    expect(exportRes.headers.get('Content-Disposition')).toContain('timeline-data-user_advanced.json')

    const deleteRes = await deleteAccount()
    const deleteBody = await deleteRes.json()
    expect(deleteRes.status).toBe(200)
    expect(deleteBody.message).toBeTruthy()

    expect(mocks.state.auditWrites.length).toBeGreaterThanOrEqual(3)
    expect(
      mocks.state.auditWrites.some((a) => a.action === 'data_export' && a.status === 'success'),
    ).toBe(true)
    expect(
      mocks.state.auditWrites.some((a) => a.action === 'account_deletion' && a.status === 'success'),
    ).toBe(true)
  })

  it('covers auth/validation/error paths for advanced routes', async () => {
    const verifyMissingRes = await verifyMfa(
      jsonRequest('POST', 'http://localhost/api/auth/mfa/verify', { factorId: 'f_only' }),
    )
    expect(verifyMissingRes.status).toBe(400)

    mocks.mfaState.listError = 'mfa_list_failed'
    const factorsErrorRes = await listMfaFactors()
    const factorsErrorBody = await factorsErrorRes.json()
    expect(factorsErrorRes.status).toBe(500)
    expect(factorsErrorBody.error).toContain('mfa_list_failed')

    mocks.authState.user = null
    mocks.authState.error = null

    const notifUnauthorized = await getNotifications()
    const gdprUnauthorized = await exportData()
    const deleteUnauthorized = await deleteAccount()
    const enrollUnauthorized = await enrollMfa(jsonRequest('POST', 'http://localhost/api/auth/mfa/enroll'))
    const verifyUnauthorized = await verifyMfa(
      jsonRequest('POST', 'http://localhost/api/auth/mfa/verify', {
        factorId: 'factor_2',
        code: '123456',
      }),
    )

    expect(notifUnauthorized.status).toBe(401)
    expect(gdprUnauthorized.status).toBe(401)
    expect(deleteUnauthorized.status).toBe(401)
    expect(enrollUnauthorized.status).toBe(401)
    expect(verifyUnauthorized.status).toBe(401)
  })
})
