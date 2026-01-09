'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CalendarTimelineProps {
  events: { event: Event; posts: Post[] }[]
}

const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/**
 * CalendarTimeline - Monthly calendar view with photo previews
 * Features:
 * - Month navigation
 * - Photo thumbnails on event days
 * - Click to view event
 * - Responsive grid
 */
export function CalendarTimeline({ events }: CalendarTimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get events for current month
  const monthEvents = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    return events.filter(({ event }) => {
      const eventDate = new Date(event.event_date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
  }, [events, currentDate])

  // Create event map by day
  const eventsByDay = useMemo(() => {
    const map = new Map<number, { event: Event; posts: Post[] }[]>()

    monthEvents.forEach(item => {
      const day = new Date(item.event.event_date).getDate()
      const existing = map.get(day) || []
      map.set(day, [...existing, item])
    })

    return map
  }, [monthEvents])

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days: (number | null)[] = []

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Days of month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i)
    }

    return days
  }, [currentDate])

  const goToPrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getCoverImage = (event: Event, posts: Post[]) => {
    if (event.cover_image_url) return event.cover_image_url
    if (posts.length > 0) return posts[0].media_url
    return null
  }

  const gradientClasses = ['bg-violet-500', 'bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500']

  const today = new Date()
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear()

  return (
    <div className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50 bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevMonth}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            {MONTHS_VI[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {monthEvents.length} sự kiện
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Quick Navigation */}
      {!isCurrentMonth && (
        <div className="px-4 py-2 bg-primary/5 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="text-primary text-sm"
          >
            ← Về hôm nay
          </Button>
        </div>
      )}

      {/* Days Header */}
      <div className="grid grid-cols-7 bg-muted/20">
        {DAYS_VI.map((day, index) => (
          <div
            key={day}
            className={cn(
              'py-3 text-center text-sm font-semibold',
              index === 0 ? 'text-red-500' : 'text-muted-foreground'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7"
        >
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square bg-muted/10" />
            }

            const dayEvents = eventsByDay.get(day) || []
            const hasEvents = dayEvents.length > 0
            const isToday = isCurrentMonth && day === today.getDate()
            const isSunday = index % 7 === 0

            return (
              <div
                key={`day-${day}`}
                className={cn(
                  'relative aspect-square border-b border-r border-border/30',
                  'transition-colors duration-200',
                  hasEvents && 'hover:bg-primary/5 cursor-pointer'
                )}
              >
                {/* Day Number */}
                <div className={cn(
                  'absolute top-1 left-1 md:top-2 md:left-2 z-10',
                  'w-6 h-6 md:w-7 md:h-7 flex items-center justify-center',
                  'text-xs md:text-sm font-medium rounded-full',
                  isToday && 'bg-primary text-white',
                  !isToday && isSunday && 'text-red-500',
                  !isToday && !isSunday && 'text-foreground'
                )}>
                  {day}
                </div>

                {/* Event Previews */}
                {hasEvents && (
                  <Link href={`/events/${dayEvents[0].event.slug}`} className="absolute inset-0">
                    <div className="absolute inset-1 md:inset-2 top-7 md:top-9 overflow-hidden rounded-lg">
                      {dayEvents.slice(0, 1).map(({ event, posts }, idx) => {
                        const coverImage = getCoverImage(event, posts)
                        const gradientClass = gradientClasses[idx % gradientClasses.length]

                        return (
                          <div key={event.id} className="relative w-full h-full group">
                            {coverImage ? (
                              <Image
                                src={coverImage}
                                alt={event.title}
                                fill
                                className="object-cover rounded-md transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className={cn(
                                'absolute inset-0 rounded-md flex items-center justify-center',
                                gradientClass
                              )}>
                                <ImageIcon className="w-4 h-4 md:w-6 md:h-6 text-white/80" />
                              </div>
                            )}

                            {/* Event count badge */}
                            {dayEvents.length > 1 && (
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                                +{dayEvents.length - 1}
                              </div>
                            )}

                            {/* Hover title */}
                            <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-md">
                              <p className="text-[10px] md:text-xs text-white font-medium truncate">
                                {event.title}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Link>
                )}
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend / Stats */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-violet-500" />
            <span>Có sự kiện</span>
          </div>
        </div>
      </div>
    </div>
  )
}
