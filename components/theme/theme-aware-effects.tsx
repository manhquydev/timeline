'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/themes/theme-provider'
import { FallingPetals } from '@/components/theme/falling-petals'
import { FallingCards, type FreshCard } from '@/components/theme/falling-cards'
import { CardOpenModal } from '@/components/theme/card-open-modal'
import { GreetingWriteForm } from '@/components/theme/greeting-write-form'

export function ThemeAwareEffects() {
  const { theme, isLoading } = useTheme()
  const pathname = usePathname()
  const [openCard, setOpenCard] = useState<{ templateId: number; preloadedGreeting?: FreshCard } | null>(null)
  const [freshCard, setFreshCard] = useState<FreshCard | null>(null)

  if (isLoading || !theme) return null

  const isFallingCards = theme.effects?.cardEffectType === 'falling-cards-8-3'
  const isFallingPetals = !isFallingCards && theme.effects?.enableParticles === true
  const isHomepage = pathname === '/'

  const handleCardCreated = useCallback((data: { templateId: number; message: string }) => {
    const card: FreshCard = { ...data, authorName: 'Bạn' }
    setFreshCard(card)
    setTimeout(() => setFreshCard(null), 91_000)
  }, [])

  return (
    <>
      {isFallingPetals && <FallingPetals />}
      {isFallingCards && isHomepage && (
        <>
          <FallingCards
            onCardClick={(templateId, freshGreeting) => setOpenCard({ templateId, preloadedGreeting: freshGreeting })}
            freshCard={freshCard}
          />
          <CardOpenModal
            isOpen={!!openCard}
            templateId={openCard?.templateId ?? null}
            preloadedGreeting={openCard?.preloadedGreeting}
            onClose={() => setOpenCard(null)}
          />
          <GreetingWriteForm onCardCreated={handleCardCreated} />
        </>
      )}
    </>
  )
}
