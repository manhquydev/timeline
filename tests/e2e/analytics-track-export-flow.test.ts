import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => {
  const state = {
    events: [] as any[],
    failTrack: false,
  }

  const authState = {
    user: { id: 'user_analytics', email: 'analytics@example.com' } as any,
    session: { user: { id: 'admin_analytics', role: 'admin' } } as any,
  }

  const analyticsRepository = {
    track: vi.fn(async (payload: any) => {
      if (state.failTrack) throw new Error('track_failed')
      state.events.push(payload)
      return payload
    }),
    find: vi.fn(async () => {
      const grouped = new Map<string, number>()
      for (const event of state.events) {
        grouped.set(event.type, (grouped.get(event.type) || 0) + (event.metrics?.count || 1))
      }
      return Array.from(grouped.entries()).map(([type, count]) => ({ type, count }))
    }),
    getDeviceBreakdown: vi.fn(async () => {
      const grouped = new Map<string, number>()
      for (const event of state.events) {
        const key = event.device || 'unknown'
        grouped.set(key, (grouped.get(key) || 0) + 1)
      }
      return Array.from(grouped.entries()).map(([key, count]) => ({ _id: key, count }))
    }),
    getTopPages: vi.fn(async (_start: Date, _end: Date, limit = 20) => {
      const pageViews = state.events.filter((e) => e.type === 'page_view')
      const grouped = new Map<string, { views: number; users: Set<string | null> }>()
      for (const event of pageViews) {
        const key = event.page || '/'
        if (!grouped.has(key)) grouped.set(key, { views: 0, users: new Set() })
        const bucket = grouped.get(key)!
        bucket.views += 1
        bucket.users.add(event.user_id || null)
      }
      return Array.from(grouped.entries())
        .map(([page, value]) => ({
          page,
          views: value.views,
          uniqueUsersCount: value.users.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit)
    }),
  }

  const createClient = vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: authState.user }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: authState.session }, error: null }),
    },
  }))

  return {
    state,
    authState,
    analyticsRepository,
    createClient,
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/mongodb/repositories', () => ({
  analyticsRepository: mocks.analyticsRepository,
}))

import { POST as trackEvent } from '@/app/api/analytics/track/route'
import { GET as exportAnalytics } from '@/app/api/analytics/export/route'

function trackRequest(body: Record<string, unknown>, userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0') {
  return new NextRequest('http://localhost/api/analytics/track', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': userAgent,
    },
    body: JSON.stringify(body),
  })
}

describe('E2E API Flow - Analytics track and export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.events = []
    mocks.state.failTrack = false
    mocks.authState.user = { id: 'user_analytics', email: 'analytics@example.com' }
    mocks.authState.session = { user: { id: 'admin_analytics', role: 'admin' } }
  })

  it('tracks multiple analytics events and exports csv report for admin', async () => {
    const trackPageView = await trackEvent(
      trackRequest(
        { type: 'page_view', page: '/home', metrics: { count: 2 } },
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile',
      ),
    )
    const trackClick = await trackEvent(
      trackRequest({ type: 'click', page: '/home', metadata: { button: 'upload' } }),
    )
    const trackUpload = await trackEvent(
      trackRequest({ type: 'upload', page: '/events/evt_1', metrics: { count: 3 }, event_id: 'evt_1' }),
    )

    expect(trackPageView.status).toBe(200)
    expect(trackClick.status).toBe(200)
    expect(trackUpload.status).toBe(200)
    expect(mocks.state.events).toHaveLength(3)
    expect(mocks.state.events[0].device).toBe('mobile')
    expect(mocks.state.events[1].device).toBe('desktop')

    const exportRes = await exportAnalytics(
      new NextRequest('http://localhost/api/analytics/export?days=30'),
    )
    const csv = await exportRes.text()

    expect(exportRes.status).toBe(200)
    expect(exportRes.headers.get('Content-Type')).toContain('text/csv')
    expect(exportRes.headers.get('Content-Disposition')).toContain('analytics-report-')
    expect(csv).toContain('Total Page Views,2')
    expect(csv).toContain('Total Clicks,1')
    expect(csv).toContain('Total Uploads,3')
    expect(csv).toContain('Device Category,Total Views,Percentage')
    expect(csv).toContain('Page Path,Views,Unique Users')
  })

  it('covers validation, unauthorized export, and tracking failure paths', async () => {
    const missingFieldsRes = await trackEvent(
      trackRequest({ type: 'page_view' }),
    )
    expect(missingFieldsRes.status).toBe(400)

    mocks.authState.session = { user: { id: 'user_normal', role: 'user' } }
    const unauthorizedExport = await exportAnalytics(
      new NextRequest('http://localhost/api/analytics/export'),
    )
    expect(unauthorizedExport.status).toBe(401)

    mocks.state.failTrack = true
    const trackErrorRes = await trackEvent(
      trackRequest({ type: 'click', page: '/error-case' }),
    )
    expect(trackErrorRes.status).toBe(500)
  })
})
