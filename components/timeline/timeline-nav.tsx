'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Event } from '@/lib/types'
import { formatShortDate } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'
import { Calendar, Image, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineNavProps {
  events: Event[]
}

export function TimelineNav({ events }: TimelineNavProps) {
  const pathname = usePathname()

  if (events.length === 0) {
    return null
  }

  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  return (
    <nav className="border-b border-border/50 bg-background/80 sticky top-0 z-40 backdrop-blur-2xl shadow-sm">
      <div className="container mx-auto">
        <div className="flex gap-3 overflow-x-auto py-5 px-4 scrollbar-hide touch-manipulation">
          <Link
            href="/"
            className={cn(
              'flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover-lift hover-shimmer relative overflow-hidden',
              pathname === '/'
                ? 'gradient-1 text-white shadow-xl'
                : 'glass-gradient hover:glass hover:shadow-lg'
            )}
          >
            <span className="relative z-10">Tất Cả Sự Kiện</span>
          </Link>

          {events.map((event, index) => {
            const gradientClass = gradientClasses[index % gradientClasses.length]
            const isActive = pathname === `/events/${event.slug}`

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className={cn(
                  'flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover-lift hover-shimmer group relative overflow-hidden',
                  isActive
                    ? `${gradientClass} text-white shadow-xl`
                    : 'glass-gradient hover:glass hover:shadow-lg'
                )}
              >
                <div className="flex items-center gap-2.5 relative z-10">
                  <span className="whitespace-nowrap">{event.title}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs font-black px-2 py-0.5 rounded-lg transition-all",
                      isActive
                        ? "bg-white/25 text-white border border-white/40 shadow-md"
                        : "bg-primary/15 text-primary border border-primary/30"
                    )}
                  >
                    {event.total_photos}
                  </Badge>
                </div>
                {/* Subtle animated underline for active state */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 animate-shimmer" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export function TimelineNavMobile({ events }: TimelineNavProps) {
  const pathname = usePathname()

  if (events.length === 0) {
    return null
  }

  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  return (
    <nav className="md:hidden border-b bg-background sticky top-0 z-10 backdrop-blur-lg bg-background/95">
      <div className="overflow-x-auto">
        <div className="flex gap-2 py-3 px-4 min-w-max touch-manipulation">
          <Link
            href="/"
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300',
              pathname === '/'
                ? 'gradient-1 text-white shadow-lg'
                : 'glass'
            )}
          >
            Tất Cả
          </Link>

          {events.map((event, index) => {
            const gradientClass = gradientClasses[index % gradientClasses.length]
            const isActive = pathname === `/events/${event.slug}`

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap',
                  isActive
                    ? `${gradientClass} text-white shadow-lg`
                    : 'glass'
                )}
              >
                {event.title}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
