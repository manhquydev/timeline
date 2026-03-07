import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  adminUser: {
    id: 'admin_1',
    email: 'admin@example.com',
    role: 'admin',
  },
  supabaseContext: {
    from: vi.fn(),
  },
  queryState: {
    profiles: [] as any[],
    roles: [] as any[],
    authUsers: [] as any[],
  },
  adminClient: {
    from: vi.fn(),
    auth: {
      admin: {
        listUsers: vi.fn(),
        deleteUser: vi.fn(),
      },
    },
  },
  upsertChain: {
    upsert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
  },
  getUserRole: vi.fn(),
  logRoleChange: vi.fn(),
  logUserDeletion: vi.fn(),
}))

vi.mock('@/lib/api-utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-utils')>('@/lib/api-utils')
  return {
    ...actual,
    withAdmin:
      (handler: any) =>
      async (request: NextRequest) =>
        handler(request, { user: mocks.adminUser, supabase: mocks.supabaseContext, request }),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => mocks.adminClient),
}))

vi.mock('@/lib/auth-utils', () => ({
  getUserRole: mocks.getUserRole,
}))

vi.mock('@/lib/services/audit-service', () => ({
  logRoleChange: mocks.logRoleChange,
  logUserDeletion: mocks.logUserDeletion,
}))

vi.mock('@/lib/logger', () => ({
  adminLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { GET, PATCH, DELETE } from '@/app/api/admin/users/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Admin Users API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.queryState.profiles = []
    mocks.queryState.roles = []
    mocks.queryState.authUsers = []

    mocks.supabaseContext.from.mockImplementation((table: string) => {
      if (table === 'user_profiles') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mocks.queryState.profiles,
              error: null,
            }),
          }),
        }
      }

      if (table === 'user_roles') {
        return {
          select: vi.fn().mockResolvedValue({
            data: mocks.queryState.roles,
            error: null,
          }),
        }
      }

      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
    })

    mocks.adminClient.auth.admin.listUsers.mockImplementation(async () => ({
      data: { users: mocks.queryState.authUsers },
      error: null,
    }))

    mocks.upsertChain.upsert.mockReturnValue(mocks.upsertChain)
    mocks.upsertChain.select.mockReturnValue(mocks.upsertChain)
    mocks.upsertChain.single.mockResolvedValue({
      data: { user_id: 'user_target', role: 'moderator' },
      error: null,
    })
    mocks.adminClient.from.mockReturnValue(mocks.upsertChain)
    mocks.adminClient.auth.admin.deleteUser.mockResolvedValue({ error: null })

    mocks.getUserRole.mockResolvedValue('user')
    mocks.logRoleChange.mockResolvedValue(undefined)
    mocks.logUserDeletion.mockResolvedValue(undefined)
  })

  it('GET joins profile, role, and auth data', async () => {
    mocks.queryState.profiles = [
      {
        id: 'u1',
        email: 'fallback-u1@example.com',
        full_name: 'User One',
        avatar_url: null,
        total_uploads: 12,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'u2',
        email: 'fallback-u2@example.com',
        full_name: 'User Two',
        avatar_url: null,
        total_uploads: 4,
        created_at: '2026-01-02T00:00:00.000Z',
      },
    ]
    mocks.queryState.roles = [{ user_id: 'u1', role: 'moderator' }]
    mocks.queryState.authUsers = [
      {
        id: 'u1',
        email: 'u1@example.com',
        last_sign_in_at: '2026-03-01T00:00:00.000Z',
        email_confirmed_at: '2026-01-01T00:00:00.000Z',
      },
    ]

    const response = await GET(jsonRequest('GET', 'http://localhost/api/admin/users'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.total).toBe(2)
    expect(body.data.users[0]).toMatchObject({
      id: 'u1',
      email: 'u1@example.com',
      role: 'moderator',
      total_uploads: 12,
    })
    expect(body.data.users[1]).toMatchObject({
      id: 'u2',
      email: 'fallback-u2@example.com',
      role: 'user',
    })
  })

  it('PATCH blocks self role change', async () => {
    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/users', {
        userId: mocks.adminUser.id,
        role: 'user',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Cannot change your own role')
    expect(mocks.adminClient.from).not.toHaveBeenCalled()
  })

  it('PATCH updates target role and writes audit', async () => {
    mocks.getUserRole
      .mockResolvedValueOnce('admin')
      .mockResolvedValueOnce('user')

    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/users', {
        userId: 'user_target',
        role: 'moderator',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.message).toContain('updated successfully')
    expect(mocks.upsertChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user_target',
        role: 'moderator',
        created_by: 'admin_1',
      }),
      { onConflict: 'user_id' },
    )
    expect(mocks.logRoleChange).toHaveBeenCalledWith(
      expect.any(NextRequest),
      { id: 'admin_1', email: 'admin@example.com' },
      'user_target',
      'user',
      'moderator',
    )
  })

  it('DELETE blocks self deletion', async () => {
    const response = await DELETE(
      jsonRequest('DELETE', `http://localhost/api/admin/users?userId=${mocks.adminUser.id}`),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Cannot delete your own account')
    expect(mocks.adminClient.auth.admin.deleteUser).not.toHaveBeenCalled()
  })

  it('DELETE removes target user and writes audit', async () => {
    mocks.getUserRole.mockResolvedValueOnce('moderator')
    mocks.adminClient.auth.admin.deleteUser.mockResolvedValueOnce({ error: null })

    const response = await DELETE(
      jsonRequest('DELETE', 'http://localhost/api/admin/users?userId=user_target'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mocks.adminClient.auth.admin.deleteUser).toHaveBeenCalledWith('user_target')
    expect(mocks.logUserDeletion).toHaveBeenCalledWith(
      expect.any(NextRequest),
      { id: 'admin_1', email: 'admin@example.com' },
      'user_target',
    )
  })
})
