import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const findChain = {
    sort: vi.fn(),
    lean: vi.fn(),
  }

  const workflowDoc = {
    id: 'wf_1',
    status: 'disabled',
    schedule: { enabled: false },
    runCount: 0,
    successCount: 0,
    failedCount: 0,
    lastRun: undefined as Date | undefined,
    lastRunResult: undefined as string | undefined,
    lastRunMessage: undefined as string | undefined,
    save: vi.fn(async function save(this: any) {
      return this
    }),
  }

  const WorkflowModel = {
    find: vi.fn(),
    countDocuments: vi.fn(),
    insertMany: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  }

  return {
    adminUser: {
      id: 'admin_1',
      email: 'admin@example.com',
      role: 'admin',
    },
    connectToDatabase: vi.fn(),
    findChain,
    workflowDoc,
    WorkflowModel,
    templates: [
      { type: 'auto-archive', name: 'Auto Archive', description: 'desc', status: 'active' },
      { type: 'media-cleanup', name: 'Media Cleanup', description: 'desc', status: 'active' },
    ],
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

vi.mock('@/lib/mongodb/models', () => ({
  getWorkflowModel: vi.fn(() => mocks.WorkflowModel),
  WORKFLOW_TEMPLATES: mocks.templates,
}))

vi.mock('@/lib/logger', () => ({
  adminLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { GET, POST, PATCH, DELETE } from '@/app/api/admin/workflows/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Admin Workflows API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.findChain.sort.mockReturnValue(mocks.findChain)
    mocks.findChain.lean.mockResolvedValue([
      { id: 'wf_a', name: 'Workflow A' },
      { id: 'wf_b', name: 'Workflow B' },
    ])
    mocks.WorkflowModel.find.mockReturnValue(mocks.findChain)

    mocks.WorkflowModel.countDocuments.mockResolvedValue(0)
    mocks.WorkflowModel.insertMany.mockResolvedValue([])
    mocks.WorkflowModel.create.mockResolvedValue({ id: 'wf_new', name: 'Custom' })
    mocks.workflowDoc.status = 'disabled'
    mocks.workflowDoc.schedule = { enabled: false }
    mocks.workflowDoc.runCount = 0
    mocks.workflowDoc.successCount = 0
    mocks.workflowDoc.failedCount = 0
    mocks.WorkflowModel.findOne.mockResolvedValue(mocks.workflowDoc)
    mocks.WorkflowModel.deleteOne.mockResolvedValue({ deletedCount: 1 })
  })

  it('GET returns workflow list', async () => {
    const response = await GET(jsonRequest('GET', 'http://localhost/api/admin/workflows'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.workflows).toHaveLength(2)
    expect(mocks.WorkflowModel.find).toHaveBeenCalledTimes(1)
  })

  it('POST seed short-circuits when workflows already exist', async () => {
    mocks.WorkflowModel.countDocuments.mockResolvedValue(3)

    const response = await POST(
      jsonRequest('POST', 'http://localhost/api/admin/workflows', {
        action: 'seed',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.seeded).toBe(false)
    expect(mocks.WorkflowModel.insertMany).not.toHaveBeenCalled()
  })

  it('POST seed inserts templates when empty', async () => {
    mocks.WorkflowModel.countDocuments.mockResolvedValue(0)

    const response = await POST(
      jsonRequest('POST', 'http://localhost/api/admin/workflows', {
        action: 'seed',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.seeded).toBe(true)
    expect(mocks.WorkflowModel.insertMany).toHaveBeenCalledTimes(1)
  })

  it('PATCH toggle flips active/disabled status', async () => {
    mocks.workflowDoc.status = 'disabled'

    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/workflows', {
        id: 'wf_1',
        action: 'toggle',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.workflow.status).toBe('active')
    expect(mocks.workflowDoc.save).toHaveBeenCalledTimes(1)
  })

  it('PATCH record-run updates counters for successful run', async () => {
    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/workflows', {
        id: 'wf_1',
        action: 'record-run',
        result: 'success',
        message: 'ok',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.workflow.runCount).toBe(1)
    expect(body.data.workflow.successCount).toBe(1)
    expect(body.data.workflow.lastRunResult).toBe('success')
  })

  it('DELETE returns 404 when workflow does not exist', async () => {
    mocks.WorkflowModel.deleteOne.mockResolvedValue({ deletedCount: 0 })

    const response = await DELETE(
      jsonRequest('DELETE', 'http://localhost/api/admin/workflows?id=missing'),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toContain('workflow')
  })
})
