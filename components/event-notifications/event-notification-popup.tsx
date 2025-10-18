'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useEventPopupStore } from '@/lib/stores/event-popup-store'
import { getActiveEventNotification } from '@/lib/config/event-notifications'
import { FlipCard, FlipCardFront, FlipCardBack } from './flip-card'
import { cn } from '@/lib/utils'

/**
 * Event Notification Popup
 * Displays special event greetings with flip card animation
 * Only shows once per event per user
 */
export function EventNotificationPopup() {
  const { isOpen, isFlipped, currentEventId, openPopup, closePopup, flipCard } = useEventPopupStore()

  useEffect(() => {
    // Check if there's an active event notification
    const activeEvent = getActiveEventNotification()

    if (activeEvent) {
      // Delay before showing popup (better UX)
      const timer = setTimeout(() => {
        openPopup(activeEvent.id)
      }, activeEvent.delayMs)

      return () => clearTimeout(timer)
    }
  }, [openPopup])

  // Don't render if no popup is open
  if (!isOpen || !currentEventId) return null

  const config = getActiveEventNotification()
  if (!config) return null

  const { content, theme } = config

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-md',
          'animate-fade-in',
          'touch-none' // Prevent scroll on mobile
        )}
        onClick={closePopup}
        aria-hidden="true"
      />

      {/* Popup container */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6',
          'pointer-events-none', // Allow clicks to pass through to backdrop
          'safe-top safe-bottom' // Handle notch on mobile
        )}
      >
        <div
          className={cn(
            'relative w-full max-w-sm sm:max-w-md',
            'pointer-events-auto', // Re-enable clicks on card
            'animate-scale-in'
          )}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card
        >
          {/* Close button - positioned outside card on desktop, inside on mobile */}
          <button
            onClick={closePopup}
            className={cn(
              'absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-10',
              'w-10 h-10 sm:w-12 sm:h-12',
              'bg-white/95 hover:bg-white rounded-full shadow-xl hover:shadow-2xl',
              'flex items-center justify-center',
              'transition-all duration-300 hover:scale-110 hover:rotate-90',
              'touch-target',
              'group'
            )}
            aria-label="Đóng thông báo"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
          </button>

          {/* Flip Card */}
          <FlipCard
            isFlipped={isFlipped}
            onFlip={flipCard}
            gradient={theme.gradient}
            frontContent={
              <FlipCardFront
                title={content.front.title}
                subtitle={content.front.subtitle}
                icon={content.front.icon}
                ctaText={content.front.ctaText}
              />
            }
            backContent={
              <FlipCardBack
                title={content.back.title}
                message={content.back.message}
                greeting={content.back.greeting}
                decorations={content.back.decorations}
              />
            }
          />

          {/* Close hint text - shown after flip */}
          {isFlipped && (
            <div className="absolute -bottom-12 left-0 right-0 text-center animate-fade-in">
              <p className="text-sm text-white/80 font-medium">
                Nhấn nút X để đóng
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Simplified popup wrapper for testing
 * Can be used to preview the popup in Storybook or dev environment
 */
export function EventNotificationPopupPreview({ eventId }: { eventId: string }) {
  const { openPopup } = useEventPopupStore()

  useEffect(() => {
    // Open immediately for preview
    openPopup(eventId)
  }, [eventId, openPopup])

  return <EventNotificationPopup />
}
