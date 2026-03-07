import { NextResponse } from 'next/server'
import { eventRepository, themeRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { apiLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/theme/active-event
 * Returns the active event that is linked to the current active theme
 * and configured for homepage greeting cards.
 */
export async function GET(req: Request) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const debug = searchParams.get('debug') === '1'
    const now = new Date()

    const activeTheme = await themeRepository.findActive()
    if (!activeTheme) {
      return NextResponse.json({
        event: null,
        ...(debug ? { debug: { reason: 'NO_ACTIVE_THEME', now } } : {}),
      })
    }

    const activeEvent = await eventRepository.findActiveGreetingEventByTheme(activeTheme.id, now)
    if (!activeEvent) {
      if (!debug) {
        return NextResponse.json({ event: null })
      }

      const candidates = await eventRepository.findLean(
        { theme_id: activeTheme.id } as any,
        { sort: { start_date: -1 }, limit: 10 },
      )

      const diagnostics = candidates.map((event: any) => ({
        id: event.id,
        title: event.title,
        slug: event.slug,
        status: event.status,
        allow_wishes: event.allow_wishes,
        enable_greeting_cards: event.enable_greeting_cards,
        greeting_tag: event.greeting_tag || null,
        start_date: event.start_date,
        end_date: event.end_date,
        checks: {
          status_open: event.status === 'open',
          allow_wishes: event.allow_wishes === true,
          enable_greeting_cards: event.enable_greeting_cards === true,
          start_date_ok: new Date(event.start_date) <= now,
          end_date_ok: !event.end_date || new Date(event.end_date) >= now,
        },
      }))

      return NextResponse.json({
        event: null,
        debug: {
          reason: 'NO_MATCHING_EVENT',
          now,
          activeTheme: {
            id: activeTheme.id,
            name: activeTheme.name,
            cardEffectType: activeTheme.effects?.cardEffectType ?? null,
          },
          diagnostics,
        },
      })
    }

    return NextResponse.json({
      event: {
        id: activeEvent.id,
        title: activeEvent.title,
        slug: activeEvent.slug,
        eventTag: activeEvent.greeting_tag || activeEvent.slug,
        themeId: activeEvent.theme_id || activeTheme.id,
      },
      ...(debug
        ? {
            debug: {
              reason: 'ACTIVE_EVENT_FOUND',
              now,
              activeTheme: {
                id: activeTheme.id,
                name: activeTheme.name,
                cardEffectType: activeTheme.effects?.cardEffectType ?? null,
              },
            },
          }
        : {}),
    })
  } catch (error) {
    apiLogger.error({ err: error }, 'Error fetching active greeting event')
    return NextResponse.json(
      { error: 'Failed to fetch active event' },
      { status: 500 }
    )
  }
}
