import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  adminUser: {
    id: 'admin_1',
    email: 'admin@example.com',
    role: 'admin',
  },
  eventRepository: {
    findBySlug: vi.fn(),
    isSlugAvailable: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  postRepository: {
    deleteByEvent: vi.fn(),
  },
  themeRepository: {
    findById: vi.fn(),
    setActive: vi.fn(),
  },
  logEventCreation: vi.fn(),
  logEventDeletion: vi.fn(),
  revalidateTag: vi.fn(),
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
  eventRepository: mocks.eventRepository,
  postRepository: mocks.postRepository,
  themeRepository: mocks.themeRepository,
}))

vi.mock('@/lib/services/audit-service', () => ({
  logEventCreation: mocks.logEventCreation,
  logEventDeletion: mocks.logEventDeletion,
}))

vi.mock('@/lib/logger', () => ({
  adminLogger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('next/cache', () => ({
  revalidateTag: mocks.revalidateTag,
}))

import { GET, POST, PATCH, DELETE } from '@/app/api/admin/events/route'

function jsonRequest(method: string, url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Admin Events API - CRUD route tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.themeRepository.findById.mockResolvedValue({ id: 'theme_default' })
  })

  it('GET returns event by slug for admin', async () => {
    mocks.eventRepository.findBySlug.mockResolvedValue({
      id: 'evt_1',
      title: 'Tet Party',
      description: 'Year-end event',
      slug: 'tet-party',
      event_date: new Date('2026-01-10T00:00:00.000Z'),
      start_date: new Date('2026-01-10T08:00:00.000Z'),
      end_date: new Date('2026-01-10T12:00:00.000Z'),
      status: 'open',
      allow_upload: true,
      allow_wishes: true,
      cover_image_url: null,
      branding: {},
      theme_id: null,
    })

    const response = await GET(jsonRequest('GET', 'http://localhost/api/admin/events?slug=tet-party'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.event.slug).toBe('tet-party')
    expect(mocks.eventRepository.findBySlug).toHaveBeenCalledWith('tet-party')
  })

  it('GET returns 404 when slug is not found', async () => {
    mocks.eventRepository.findBySlug.mockResolvedValue(null)

    const response = await GET(jsonRequest('GET', 'http://localhost/api/admin/events?slug=missing'))
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Event not found')
  })

  it('POST creates event and writes audit log', async () => {
    mocks.eventRepository.isSlugAvailable.mockResolvedValue(true)
    mocks.eventRepository.create.mockResolvedValue({
      id: 'evt_2',
      title: 'Demo Day',
      slug: 'demo-day',
    })
    mocks.logEventCreation.mockResolvedValue(undefined)

    const response = await POST(
      jsonRequest('POST', 'http://localhost/api/admin/events', {
        title: 'Demo Day',
        description: 'Product demo',
        slug: 'demo-day',
        event_date: '2026-04-01T00:00:00.000Z',
        start_date: '2026-04-01T08:00:00.000Z',
        end_date: '2026-04-01T11:00:00.000Z',
        status: 'draft',
        allow_upload: true,
        allow_wishes: true,
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.success).toBe(true)
    expect(body.data.event.slug).toBe('demo-day')
    expect(mocks.eventRepository.isSlugAvailable).toHaveBeenCalledWith('demo-day')
    expect(mocks.eventRepository.create).toHaveBeenCalledTimes(1)
    expect(mocks.logEventCreation).toHaveBeenCalledTimes(1)
  })

  it('POST rejects duplicated slug', async () => {
    mocks.eventRepository.isSlugAvailable.mockResolvedValue(false)

    const response = await POST(
      jsonRequest('POST', 'http://localhost/api/admin/events', {
        title: 'Duplicate Slug',
        slug: 'duplicate-slug',
        event_date: '2026-04-01T00:00:00.000Z',
        start_date: '2026-04-01T08:00:00.000Z',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Slug already exists')
    expect(mocks.eventRepository.create).not.toHaveBeenCalled()
  })

  it('PATCH rejects slug conflict when changed slug is already taken', async () => {
    mocks.eventRepository.findById.mockResolvedValue({ id: 'evt_1', slug: 'old-slug' })
    mocks.eventRepository.isSlugAvailable.mockResolvedValue(false)

    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/events', {
        id: 'evt_1',
        slug: 'new-slug',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Slug already exists')
    expect(mocks.eventRepository.update).not.toHaveBeenCalled()
  })

  it('PATCH returns 404 when event does not exist', async () => {
    mocks.eventRepository.update.mockResolvedValue(null)

    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/events', {
        id: 'evt_missing',
        title: 'Updated title',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Event not found')
  })

  it('PATCH activate_theme returns 404 when event does not exist', async () => {
    mocks.eventRepository.findById.mockResolvedValue(null)

    const response = await PATCH(
      jsonRequest('PATCH', 'http://localhost/api/admin/events', {
        id: 'evt_missing',
        activate_theme: true,
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Event not found')
  })

  it('POST can activate linked theme when activate_theme=true', async () => {
    mocks.eventRepository.isSlugAvailable.mockResolvedValue(true)
    mocks.eventRepository.create.mockResolvedValue({
      id: 'evt_4',
      title: 'Women Day',
      slug: 'women-day',
    })
    mocks.themeRepository.setActive.mockResolvedValue({ id: 'theme_8_3' })

    const response = await POST(
      jsonRequest('POST', 'http://localhost/api/admin/events', {
        title: 'Women Day',
        slug: 'women-day',
        event_date: '2026-03-08T00:00:00.000Z',
        start_date: '2026-03-08T08:00:00.000Z',
        theme_id: 'theme_8_3',
        activate_theme: true,
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.themeActivated).toBe(true)
    expect(mocks.themeRepository.setActive).toHaveBeenCalledWith('theme_8_3')
    expect(mocks.revalidateTag).toHaveBeenCalledWith('theme', 'max')
  })

  it('DELETE removes related posts then deletes event', async () => {
    mocks.eventRepository.findById.mockResolvedValue({ id: 'evt_3', title: 'Delete Me' })
    mocks.postRepository.deleteByEvent.mockResolvedValue(4)
    mocks.eventRepository.delete.mockResolvedValue(true)
    mocks.logEventDeletion.mockResolvedValue(undefined)

    const response = await DELETE(
      jsonRequest('DELETE', 'http://localhost/api/admin/events?id=evt_3'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.deletedPostsCount).toBe(4)
    expect(mocks.postRepository.deleteByEvent).toHaveBeenCalledWith('evt_3')
    expect(mocks.eventRepository.delete).toHaveBeenCalledWith('evt_3')
    expect(mocks.logEventDeletion).toHaveBeenCalledTimes(1)
  })

  it('DELETE returns 404 when event does not exist', async () => {
    mocks.eventRepository.findById.mockResolvedValue(null)

    const response = await DELETE(
      jsonRequest('DELETE', 'http://localhost/api/admin/events?id=evt_missing'),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Event not found')
    expect(mocks.postRepository.deleteByEvent).not.toHaveBeenCalled()
  })
})
