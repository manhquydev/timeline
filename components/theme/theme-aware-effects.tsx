'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/themes/theme-provider'
import { FallingPetals } from '@/components/theme/falling-petals'
import { FallingCards } from '@/components/theme/falling-cards'
import { CardOpenModal } from '@/components/theme/card-open-modal'
import { GreetingWriteForm } from '@/components/theme/greeting-write-form'

export function ThemeAwareEffects() {
  const { theme, isLoading } = useTheme()
  const [openCard, setOpenCard] = useState<{ templateId: number } | null>(null)

  if (isLoading || !theme) return null

  const isFallingCards = theme.effects?.cardEffectType === 'falling-cards-8-3'
  const isFallingPetals = !isFallingCards && theme.effects?.enableParticles === true

  return (
    <>
      {isFallingPetals && <FallingPetals />}
      {isFallingCards && (
        <>
          <FallingCards onCardClick={(templateId) => setOpenCard({ templateId })} />
          <CardOpenModal
            isOpen={!!openCard}
            templateId={openCard?.templateId ?? null}
            onClose={() => setOpenCard(null)}
          />
          <GreetingWriteForm />
        </>
      )}
    </>
  )
}
