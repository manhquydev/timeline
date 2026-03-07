'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { FallingCards, type FreshCard } from '@/components/theme/falling-cards'
import { FallingPetals } from '@/components/theme/falling-petals'
import { CardOpenModal } from '@/components/theme/card-open-modal'
import { GreetingWriteForm } from '@/components/theme/greeting-write-form'
import { useTheme } from '@/lib/themes/theme-provider'

interface ActiveGreetingEvent {
  id: string
  title: string
  slug: string
  eventTag: string
  themeId?: string
}

export function ThemeAwareEffects() {
  const { theme, isLoading } = useTheme()
  const pathname = usePathname()

  const [openCard, setOpenCard] = useState<{ templateId: number; preloadedGreeting?: FreshCard } | null>(null)
  const [freshCard, setFreshCard] = useState<FreshCard | null>(null)
  const [activeEvent, setActiveEvent] = useState<ActiveGreetingEvent | null>(null)
  const [isResolvingActiveEvent, setIsResolvingActiveEvent] = useState(false)

  const isHomepage = pathname === '/'
  const canRenderFallingCards = isHomepage && !!activeEvent
  const isFallingPetals = !canRenderFallingCards && !isResolvingActiveEvent && theme?.effects?.enableParticles === true

  useEffect(() => {
    let cancelled = false

    const loadActiveEvent = async () => {
      if (!isHomepage) {
        setActiveEvent(null)
        setIsResolvingActiveEvent(false)
        return
      }

      setIsResolvingActiveEvent(true)

      try {
        const response = await fetch('/api/theme/active-event')
        if (!response.ok) {
          if (!cancelled) {
            setActiveEvent(null)
            setIsResolvingActiveEvent(false)
          }
          return
        }

        const payload = await response.json()
        const eventPayload = payload?.event

        if (!cancelled) {
          if (
            eventPayload &&
            typeof eventPayload.id === 'string' &&
            typeof eventPayload.slug === 'string' &&
            typeof eventPayload.eventTag === 'string'
          ) {
            setActiveEvent({
              id: eventPayload.id,
              title: typeof eventPayload.title === 'string' ? eventPayload.title : '',
              slug: eventPayload.slug,
              eventTag: eventPayload.eventTag,
              themeId: typeof eventPayload.themeId === 'string' ? eventPayload.themeId : undefined,
            })
          } else {
            setActiveEvent(null)
          }
          setIsResolvingActiveEvent(false)
        }
      } catch {
        if (!cancelled) {
          setActiveEvent(null)
          setIsResolvingActiveEvent(false)
        }
      }
    }

    void loadActiveEvent()

    return () => {
      cancelled = true
    }
  }, [isHomepage, theme?.id])

  const handleCardCreated = useCallback((data: { templateId: number; message: string }) => {
    const card: FreshCard = { ...data, authorName: 'Ban' }
    setFreshCard(card)
    setTimeout(() => setFreshCard(null), 91_000)
  }, [])

  if (isLoading || !theme) return null

  return (
    <>
      {isFallingPetals && <FallingPetals />}

      {canRenderFallingCards && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-[9] pointer-events-none"
            style={{
              background:
                'radial-gradient(1200px 500px at 50% -10%, rgba(244,63,94,0.12), transparent 60%), radial-gradient(1000px 380px at 50% 110%, rgba(236,72,153,0.1), transparent 62%)',
            }}
          />
          <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-[12]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/75 border border-pink-100 px-3 py-1 text-[11px] font-medium text-pink-600 shadow-sm backdrop-blur-sm">
              Chạm vào thiệp để mở, lật mặt sau để xem sự kiện liên kết
            </span>
          </div>

          <FallingCards
            onCardClick={(templateId, preloadedGreeting) =>
              setOpenCard({ templateId, preloadedGreeting })
            }
            freshCard={freshCard}
          />

          <CardOpenModal
            isOpen={!!openCard}
            templateId={openCard?.templateId ?? null}
            eventTag={activeEvent!.eventTag}
            eventId={activeEvent!.id}
            eventSlug={activeEvent!.slug}
            eventTitle={activeEvent!.title}
            preloadedGreeting={openCard?.preloadedGreeting}
            onClose={() => setOpenCard(null)}
          />

          <GreetingWriteForm
            eventTag={activeEvent!.eventTag}
            eventId={activeEvent!.id}
            eventSlug={activeEvent!.slug}
            eventTitle={activeEvent!.title}
            onCardCreated={handleCardCreated}
          />
        </>
      )}
    </>
  )
}
