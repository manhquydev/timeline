'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventBentoCardProps {
  event: {
    id: string
    title: string
    slug: string
    event_date: string
    cover_image_url: string | null
    total_photos: number
  }
  size?: 'default' | 'feature'
  index?: number
}

/**
 * EventBentoCard - Individual event card for bento grid
 * Features:
 * - Cover image with gradient overlay
 * - Title, date, photo count badge
 * - Hover: lift + glow + image zoom
 * - Glass morphism effect
 */
export function EventBentoCard({ event, size = 'default', index = 0 }: EventBentoCardProps) {
  const isFeature = size === 'feature'

  const formattedDate = new Date(event.event_date).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 100,
        delay: index * 0.1
      }}
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'bg-white/80 backdrop-blur-xl',
        'border border-white/50',
        'shadow-lg hover:shadow-2xl hover:shadow-primary/20',
        'transition-all duration-500',
        isFeature ? 'col-span-2 row-span-2' : ''
      )}
    >
      <Link href={`/events/${event.slug}`} className="block h-full">
        {/* Image container */}
        <div className={cn(
          'relative overflow-hidden',
          isFeature ? 'h-80 md:h-96' : 'h-48 md:h-56'
        )}>
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes={isFeature ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Photo count badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{event.total_photos}</span>
          </div>

          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-5 md:p-6">
          <h3 className={cn(
            'font-bold text-foreground mb-2 line-clamp-2',
            'group-hover:text-primary transition-colors duration-300',
            isFeature ? 'text-xl md:text-2xl' : 'text-lg'
          )}>
            {event.title}
          </h3>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
        </div>

        {/* Hover lift effect */}
        <div className="absolute inset-0 -z-10 rounded-3xl transition-transform duration-500 group-hover:-translate-y-2" />
      </Link>
    </motion.div>
  )
}
