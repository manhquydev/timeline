'use client'

import { motion } from 'framer-motion'
import { EventBentoCard } from './event-bento-card'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  slug: string
  event_date: string
  cover_image_url: string | null
  total_photos: number
}

interface EventBentoGridProps {
  events: Event[]
  className?: string
}

/**
 * EventBentoGrid - Asymmetric grid layout (bento style)
 * Features:
 * - 2 cols mobile, 3-4 cols desktop
 * - Different card sizes (feature card larger)
 * - Staggered entrance animation
 */
export function EventBentoGrid({ events, className }: EventBentoGridProps) {
  if (!events || events.length === 0) return null

  // First event is featured (larger)
  const [featuredEvent, ...restEvents] = events

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className={cn(
        'grid gap-4 md:gap-6',
        // 2 cols on mobile, 3 cols on tablet, 4 cols on desktop
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        // Auto rows with minimum height
        'auto-rows-auto',
        className
      )}
    >
      {/* Featured event - spans 2 cols and 2 rows */}
      {featuredEvent && (
        <EventBentoCard
          event={featuredEvent}
          size="feature"
          index={0}
        />
      )}

      {/* Rest of events - normal size */}
      {restEvents.map((event, index) => (
        <EventBentoCard
          key={event.id}
          event={event}
          size="default"
          index={index + 1}
        />
      ))}
    </motion.div>
  )
}
