import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const findOneChain = {
    lean: vi.fn(),
  }

  const SettingsModel = {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  }

  return {
    adminUser: {
      id: 'admin_1',
      email: 'admin@example.com',
      role: 'admin',
    },
    connectToDatabase: vi.fn(),
    findOneChain,
    SettingsModel,
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
  getSettingsModel: vi.fn(() => mocks.SettingsModel),
}))

vi.mock('@/lib/logger', () => ({
  adminLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { GET, PATCH } from '@/app/api/admin/settings/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Admin Settings API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.findOneChain.lean.mockResolvedValue({
      value: {
        site: { name: 'Timeline', description: 'desc', maintenanceMode: false },
        upload: {
          maxFileSize: 10,
          allowedTypes: ['image/jpeg'],
          autoApprove: false,
          compressionQuality: 80,
        },
        notifications: {
          emailOnNewPost: true,
          emailOnNewUser: true,
          emailOnPendingReview: true,
        },
      },
    })
    mocks.SettingsModel.findOne.mockReturnValue(mocks.findOneChain)
    mocks.SettingsModel.findOneAndUpdate.mockResolvedValue({
      value: {
        site: { name: 'Timeline Updated', description: 'desc', maintenanceMode: false },
        upload: {
          maxFileSize: 12,
          allowedTypes: ['image/jpeg', 'image/png'],
          autoApprove: false,
          compressionQuality: 85,
        },
        notifications: {
          emailOnNewPost: true,
          emailOnNewUser: false,
          emailOnPendingReview: true,
        },
      },
    })
  })

  it('GET returns current settings value', async () => {
    const response = await GET(
      jsonRequest('GET', 'http://localhost/api/admin/settings'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.site.name).toBe('Timeline')
  })

  it('PATCH rejects invalid payload shape', async () => {
    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/settings', {
        site: { name: '', description: 'desc', maintenanceMode: false },
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('PATCH upserts valid settings and returns updated value', async () => {
    const payload = {
      site: { name: 'Timeline Updated', description: 'desc', maintenanceMode: false },
      upload: {
        maxFileSize: 12,
        allowedTypes: ['image/jpeg', 'image/png'],
        autoApprove: false,
        compressionQuality: 85,
      },
      notifications: {
        emailOnNewPost: true,
        emailOnNewUser: false,
        emailOnPendingReview: true,
      },
    }

    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/settings', payload),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.success).toBe(true)
    expect(body.data.settings.site.name).toBe('Timeline Updated')
    expect(mocks.SettingsModel.findOneAndUpdate).toHaveBeenCalledWith(
      { key: 'global' },
      expect.objectContaining({
        key: 'global',
        value: payload,
        updatedBy: 'admin_1',
      }),
      { upsert: true, new: true },
    )
  })
})
