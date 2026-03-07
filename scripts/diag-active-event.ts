import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { connectToDatabase } from '../lib/mongodb/connection'
import { eventRepository, themeRepository } from '../lib/mongodb/repositories'

async function main() {
  await connectToDatabase()

  const activeTheme = await themeRepository.findActive()
  console.log('ACTIVE_THEME:', activeTheme ? {
    id: activeTheme.id,
    name: activeTheme.name,
    cardEffectType: activeTheme.effects?.cardEffectType,
    isActive: activeTheme.isActive,
  } : null)

  if (!activeTheme) return

  const allByTheme = await eventRepository.findLean({ theme_id: activeTheme.id } as any, { sort: { start_date: -1 } })
  console.log('EVENTS_WITH_THEME_COUNT:', allByTheme.length)

  const now = new Date()
  const diagnostics = allByTheme.map((e: any) => ({
    id: e.id,
    title: e.title,
    status: e.status,
    allow_wishes: e.allow_wishes,
    enable_greeting_cards: e.enable_greeting_cards,
    greeting_tag: e.greeting_tag,
    start_date: e.start_date,
    end_date: e.end_date,
    cond_status_open: e.status === 'open',
    cond_allow_wishes: e.allow_wishes === true,
    cond_enable_cards: e.enable_greeting_cards === true,
    cond_start_ok: new Date(e.start_date) <= now,
    cond_end_ok: !e.end_date || new Date(e.end_date) >= now,
  }))

  console.log('EVENTS_DIAGNOSTICS:', diagnostics)

  const activeEvent = await eventRepository.findActiveGreetingEventByTheme(activeTheme.id, now)
  console.log('ACTIVE_EVENT_RESULT:', activeEvent ? {
    id: activeEvent.id,
    title: activeEvent.title,
    greeting_tag: activeEvent.greeting_tag,
    slug: activeEvent.slug,
  } : null)
}

main().catch((err) => {
  console.error('DIAG_ERROR:', err)
  process.exit(1)
})
