import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  adminUser: {
    id: 'admin_1',
    email: 'admin@example.com',
    role: 'admin',
  },
  teamMemberRepository: {
    findAll: vi.fn(),
    findActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getNextOrder: vi.fn(),
    updateOrders: vi.fn(),
  },
}))

vi.mock('@/lib/api-utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-utils')>('@/lib/api-utils')
  return {
    ...actual,
    withAdmin:
      (handler: any) =>
      async (request: NextRequest) =>
        handler(request, { user: mocks.adminUser, supabase: {}, request }),
  }
})

vi.mock('@/lib/mongodb/repositories', () => ({
  teamMemberRepository: mocks.teamMemberRepository,
}))

vi.mock('@/lib/logger', () => ({
  adminLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { GET, POST, PATCH, DELETE } from '@/app/api/admin/team/route'
import { POST as reorderPOST } from '@/app/api/admin/team/reorder/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Admin Team API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.teamMemberRepository.getNextOrder.mockResolvedValue(9)
  })

  it('GET returns active members when query active=true', async () => {
    mocks.teamMemberRepository.findActive.mockResolvedValue([
      {
        id: 'm1',
        name: 'Alice',
        role: 'Designer',
        avatar_url: null,
        description: null,
        bio: 'bio',
        order: 1,
        social_links: {},
        is_active: true,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-02T00:00:00.000Z'),
      },
    ])

    const response = await GET(jsonRequest('GET', 'http://localhost/api/admin/team?active=true'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.total).toBe(1)
    expect(body.data.members[0]).toMatchObject({
      id: 'm1',
      name: 'Alice',
      role: 'Designer',
      created_at: '2026-01-01T00:00:00.000Z',
    })
    expect(mocks.teamMemberRepository.findActive).toHaveBeenCalledTimes(1)
    expect(mocks.teamMemberRepository.findAll).not.toHaveBeenCalled()
  })

  it('POST creates member with computed order when order is omitted', async () => {
    mocks.teamMemberRepository.create.mockResolvedValue({
      id: 'm2',
      name: 'Bob',
      role: 'Engineer',
      order: 9,
    })

    const response = await POST(
      jsonRequest('POST', 'http://localhost/api/admin/team', {
        name: 'Bob',
        role: 'Engineer',
        bio: 'new member',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.member).toMatchObject({
      id: 'm2',
      name: 'Bob',
      role: 'Engineer',
      order: 9,
    })
    expect(mocks.teamMemberRepository.getNextOrder).toHaveBeenCalledTimes(1)
    expect(mocks.teamMemberRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bob',
        role: 'Engineer',
        order: 9,
        is_active: true,
      }),
    )
  })

  it('PATCH returns 404 when team member does not exist', async () => {
    mocks.teamMemberRepository.update.mockResolvedValue(null)

    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/team', {
        id: 'missing_id',
        name: 'Nope',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Team member not found')
  })

  it('DELETE removes a team member by id query', async () => {
    mocks.teamMemberRepository.delete.mockResolvedValue(true)

    const response = await DELETE(
      jsonRequest('DELETE', 'http://localhost/api/admin/team?id=m9'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mocks.teamMemberRepository.delete).toHaveBeenCalledWith('m9')
  })

  it('POST /team/reorder validates orders payload and updates order', async () => {
    mocks.teamMemberRepository.updateOrders.mockResolvedValue(true)

    const invalidResponse = await reorderPOST(
      jsonRequest('POST', 'http://localhost/api/admin/team/reorder', {
        orders: [{ id: 'm1', order: 'x' }],
      }),
    )
    expect(invalidResponse.status).toBe(400)

    const validResponse = await reorderPOST(
      jsonRequest('POST', 'http://localhost/api/admin/team/reorder', {
        orders: [
          { id: 'm1', order: 1 },
          { id: 'm2', order: 2 },
        ],
      }),
    )
    const body = await validResponse.json()

    expect(validResponse.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mocks.teamMemberRepository.updateOrders).toHaveBeenCalledWith([
      { id: 'm1', order: 1 },
      { id: 'm2', order: 2 },
    ])
  })
})
