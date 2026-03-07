import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const state = {
    teamMembers: [] as any[],
    teamSeq: 0,
    settings: null as any,
    workflows: [] as any[],
    workflowSeq: 0,
    events: [] as any[],
    posts: [] as any[],
  }

  const teamMemberRepository = {
    findAll: vi.fn(async () => [...state.teamMembers].sort((a, b) => a.order - b.order)),
    findActive: vi.fn(async () => [...state.teamMembers.filter((m) => m.is_active)].sort((a, b) => a.order - b.order)),
    getNextOrder: vi.fn(async () => state.teamMembers.length),
    create: vi.fn(async (data: any) => {
      state.teamSeq += 1
      const now = new Date()
      const member = {
        id: `tm_${state.teamSeq}`,
        ...data,
        created_at: now,
        updated_at: now,
      }
      state.teamMembers.push(member)
      return member
    }),
    update: vi.fn(async (id: string, patch: any) => {
      const idx = state.teamMembers.findIndex((m) => m.id === id)
      if (idx === -1) return null
      state.teamMembers[idx] = {
        ...state.teamMembers[idx],
        ...patch,
        updated_at: new Date(),
      }
      return state.teamMembers[idx]
    }),
    delete: vi.fn(async (id: string) => {
      const before = state.teamMembers.length
      state.teamMembers = state.teamMembers.filter((m) => m.id !== id)
      return state.teamMembers.length < before
    }),
    updateOrders: vi.fn(async (orders: Array<{ id: string; order: number }>) => {
      for (const item of orders) {
        const member = state.teamMembers.find((m) => m.id === item.id)
        if (member) member.order = item.order
      }
      return true
    }),
  }

  const eventRepository = {
    findAll: vi.fn(async () => state.events),
  }

  const WorkflowModel = {
    find: vi.fn(() => ({
      sort: vi.fn(() => ({
        lean: vi.fn(async () => [...state.workflows]),
      })),
    })),
    countDocuments: vi.fn(async () => state.workflows.length),
    insertMany: vi.fn(async (docs: any[]) => {
      for (const doc of docs) {
        state.workflowSeq += 1
        state.workflows.push({
          id: `wf_${state.workflowSeq}`,
          ...doc,
          schedule: doc.schedule || { enabled: false },
          runCount: doc.runCount || 0,
          successCount: doc.successCount || 0,
          failedCount: doc.failedCount || 0,
        })
      }
      return docs
    }),
    create: vi.fn(async (doc: any) => {
      state.workflowSeq += 1
      const created = {
        id: `wf_${state.workflowSeq}`,
        ...doc,
      }
      state.workflows.push(created)
      return created
    }),
    findOne: vi.fn(async ({ id }: { id: string }) => {
      const wf = state.workflows.find((item) => item.id === id)
      if (!wf) return null
      return {
        ...wf,
        save: vi.fn(async function save(this: any) {
          const idx = state.workflows.findIndex((item) => item.id === this.id)
          if (idx !== -1) {
            const { save: _save, ...rest } = this as any
            state.workflows[idx] = { ...rest }
          }
          return this
        }),
      }
    }),
    deleteOne: vi.fn(async ({ id }: { id: string }) => {
      const before = state.workflows.length
      state.workflows = state.workflows.filter((wf) => wf.id !== id)
      return { deletedCount: before - state.workflows.length }
    }),
  }

  const SettingsModel = {
    findOne: vi.fn(() => ({
      lean: vi.fn(async () => (state.settings ? { value: state.settings } : null)),
    })),
    findOneAndUpdate: vi.fn(async (_query: any, payload: any) => {
      state.settings = payload.value
      return { value: state.settings }
    }),
  }

  const PostModel = {
    find: vi.fn(() => ({
      lean: vi.fn(async () => [...state.posts]),
    })),
    deleteMany: vi.fn(async ({ id }: any) => {
      const deleteIds: string[] = id?.$in || []
      const before = state.posts.length
      state.posts = state.posts.filter((post) => !deleteIds.includes(post.id))
      return { deletedCount: before - state.posts.length }
    }),
  }

  return {
    state,
    adminUser: {
      id: 'admin_flow',
      email: 'admin-flow@example.com',
      role: 'admin',
    },
    connectToDatabase: vi.fn().mockResolvedValue(undefined),
    teamMemberRepository,
    eventRepository,
    WorkflowModel,
    SettingsModel,
    PostModel,
    workflowTemplates: [
      { type: 'auto-archive', name: 'Auto Archive', description: 'Auto archive events', status: 'active', schedule: { enabled: true } },
      { type: 'media-cleanup', name: 'Media Cleanup', description: 'Cleanup stale media', status: 'active', schedule: { enabled: true } },
    ],
    adminLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  }
})

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

vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: mocks.connectToDatabase,
}))

vi.mock('@/lib/mongodb/repositories', () => ({
  teamMemberRepository: mocks.teamMemberRepository,
  eventRepository: mocks.eventRepository,
}))

vi.mock('@/lib/mongodb/models', () => ({
  getWorkflowModel: vi.fn(() => mocks.WorkflowModel),
  WORKFLOW_TEMPLATES: mocks.workflowTemplates,
  getSettingsModel: vi.fn(() => mocks.SettingsModel),
  Post: mocks.PostModel,
}))

vi.mock('@/lib/logger', () => ({
  adminLogger: mocks.adminLogger,
}))

import { GET as getTeam, POST as createTeam, DELETE as deleteTeam } from '@/app/api/admin/team/route'
import { POST as reorderTeam } from '@/app/api/admin/team/reorder/route'
import { GET as getSettings, PATCH as patchSettings } from '@/app/api/admin/settings/route'
import { GET as getWorkflows, POST as createWorkflow, PATCH as patchWorkflow, DELETE as deleteWorkflow } from '@/app/api/admin/workflows/route'
import { POST as cleanupOrphanedPosts } from '@/app/api/admin/cleanup/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('E2E API Flow - Extended admin operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.teamMembers = []
    mocks.state.teamSeq = 0
    mocks.state.settings = null
    mocks.state.workflows = []
    mocks.state.workflowSeq = 0
    mocks.state.events = []
    mocks.state.posts = []
  })

  it('covers team create/reorder/delete + settings update + workflow seed/toggle/delete', async () => {
    const createFirst = await createTeam(
      jsonRequest('POST', 'http://localhost/api/admin/team', {
        name: 'Alice',
        role: 'Designer',
        bio: 'Design lead',
      }),
    )
    const createSecond = await createTeam(
      jsonRequest('POST', 'http://localhost/api/admin/team', {
        name: 'Bob',
        role: 'Engineer',
        bio: 'Backend engineer',
      }),
    )
    const firstBody = await createFirst.json()
    const secondBody = await createSecond.json()
    expect(createFirst.status).toBe(200)
    expect(createSecond.status).toBe(200)

    const reorderRes = await reorderTeam(
      jsonRequest('POST', 'http://localhost/api/admin/team/reorder', {
        orders: [
          { id: firstBody.data.member.id, order: 2 },
          { id: secondBody.data.member.id, order: 1 },
        ],
      }),
    )
    expect(reorderRes.status).toBe(200)

    const teamRes = await getTeam(
      jsonRequest('GET', 'http://localhost/api/admin/team?active=true'),
    )
    const teamBody = await teamRes.json()
    expect(teamRes.status).toBe(200)
    expect(teamBody.data.members[0].id).toBe(secondBody.data.member.id)

    const deleteTeamRes = await deleteTeam(
      jsonRequest('DELETE', `http://localhost/api/admin/team?id=${firstBody.data.member.id}`),
    )
    expect(deleteTeamRes.status).toBe(200)
    expect(mocks.state.teamMembers).toHaveLength(1)

    const settingsPayload = {
      site: {
        name: 'Timeline E2E',
        description: 'Settings by e2e flow',
        maintenanceMode: false,
      },
      upload: {
        maxFileSize: 12,
        allowedTypes: ['image/jpeg', 'image/png'],
        autoApprove: true,
        compressionQuality: 80,
      },
      notifications: {
        emailOnNewPost: true,
        emailOnNewUser: true,
        emailOnPendingReview: false,
      },
    }

    const patchSettingsRes = await patchSettings(
      jsonRequest('PATCH', 'http://localhost/api/admin/settings', settingsPayload),
    )
    expect(patchSettingsRes.status).toBe(200)

    const getSettingsRes = await getSettings(
      jsonRequest('GET', 'http://localhost/api/admin/settings'),
    )
    const getSettingsBody = await getSettingsRes.json()
    expect(getSettingsRes.status).toBe(200)
    expect(getSettingsBody.data.site.name).toBe('Timeline E2E')

    const seedRes = await createWorkflow(
      jsonRequest('POST', 'http://localhost/api/admin/workflows', { action: 'seed' }),
    )
    const seedBody = await seedRes.json()
    expect(seedRes.status).toBe(200)
    expect(seedBody.data.seeded).toBe(true)

    const workflowsRes = await getWorkflows(
      jsonRequest('GET', 'http://localhost/api/admin/workflows'),
    )
    const workflowsBody = await workflowsRes.json()
    const workflowId = workflowsBody.data.workflows[0].id
    expect(workflowsRes.status).toBe(200)
    expect(workflowsBody.data.workflows.length).toBeGreaterThan(0)

    const toggleRes = await patchWorkflow(
      jsonRequest('PATCH', 'http://localhost/api/admin/workflows', {
        id: workflowId,
        action: 'toggle',
      }),
    )
    const toggleBody = await toggleRes.json()
    expect(toggleRes.status).toBe(200)
    expect(toggleBody.data.workflow.status).toBe('disabled')

    const deleteWfRes = await deleteWorkflow(
      jsonRequest('DELETE', `http://localhost/api/admin/workflows?id=${workflowId}`),
    )
    expect(deleteWfRes.status).toBe(200)
  })

  it('covers cleanup flow deleting orphaned posts', async () => {
    mocks.state.events = [{ id: 'evt_1' }]
    mocks.state.posts = [
      { id: 'post_valid', event_id: 'evt_1' },
      { id: 'post_orphan', event_id: 'evt_deleted' },
    ]

    const cleanupRes = await cleanupOrphanedPosts(
      jsonRequest('POST', 'http://localhost/api/admin/cleanup'),
    )
    const cleanupBody = await cleanupRes.json()

    expect(cleanupRes.status).toBe(200)
    expect(cleanupBody.success).toBe(true)
    expect(cleanupBody.data.deletedCount).toBe(1)
    expect(cleanupBody.data.orphanedPostIds).toEqual(['post_orphan'])
    expect(mocks.state.posts.map((p) => p.id)).toEqual(['post_valid'])
  })
})
