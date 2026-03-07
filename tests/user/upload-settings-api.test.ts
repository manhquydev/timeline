import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  user: { id: 'user_1', email: 'user@example.com' } as any,
  getUploadEngineSettings: vi.fn(async () => ({
    maxFileSizeMB: 12,
    maxFileSizeBytes: 12 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    autoApprove: false,
    compressionQuality: 85,
    mainImageQuality: 85,
    thumbnailQuality: 77,
    thumbnailMaxSize: 640,
    clientCompressionTargetMB: 2.3,
    maxWidth: 2560,
    maxHeight: 2560,
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mocks.user }, error: null }),
    },
  })),
}))

vi.mock('@/lib/upload-engine-settings', () => ({
  getUploadEngineSettings: mocks.getUploadEngineSettings,
}))

import { GET } from '@/app/api/upload/settings/route'

describe('GET /api/upload/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { id: 'user_1', email: 'user@example.com' } as any
  })

  it('returns runtime upload settings for authenticated users', async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.maxFileSizeMB).toBe(12)
    expect(body.compressionQuality).toBe(85)
    expect(body.compressionTargetMB).toBe(2.3)
    expect(body.allowedTypes).toEqual(['image/jpeg', 'image/png', 'image/webp'])
    expect(body.maxWidth).toBe(2560)
  })

  it('returns 401 for unauthenticated users', async () => {
    mocks.user = null
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })
})

