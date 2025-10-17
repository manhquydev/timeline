'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { formatDateRange, formatShortDate } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'
import { Calendar, Image as ImageIcon, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventPhotoMosaic } from '../events/event-photo-mosaic'

interface VerticalTimelineProps {
  events: { event: Event; posts: Post[] }[]
}

export function VerticalTimeline({ events }: VerticalTimelineProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleItems((prev) => new Set(prev).add(index))
          }
        })
      },
      { threshold: 0.2 }
    )

    return () => observerRef.current?.disconnect()
  }, [])

  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  const statusColors = {
    draft: 'bg-gray-500/10 text-gray-700 border-gray-300',
    open: 'bg-green-500/10 text-green-700 border-green-300',
    closed: 'bg-blue-500/10 text-blue-700 border-blue-300',
    archived: 'bg-gray-400/10 text-gray-600 border-gray-300',
  }

  const statusLabels = {
    draft: 'Nháp',
    open: 'Đang Mở',
    closed: 'Đã Đóng',
    archived: 'Lưu Trữ'
  }

  if (events.length === 0) {
    return null
  }

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
  )

  return (
    <div className="relative py-12">
      {/* Timeline line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 transform md:-translate-x-1/2" />

      <div className="space-y-12 md:space-y-16">
        {sortedEvents.map(({ event, posts }, index) => {
          const gradientClass = gradientClasses[index % gradientClasses.length]
          const isEven = index % 2 === 0
          const isVisible = visibleItems.has(index)

          return (
            <div
              key={event.id}
              data-index={index}
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el)
                }
              }}
              className={cn(
                'relative transition-all duration-700',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              {/* Timeline node */}
              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 z-10">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-500',
                  gradientClass,
                  isVisible && 'scale-100 rotate-0',
                  !isVisible && 'scale-0 rotate-180'
                )}>
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content card */}
              <Link href={`/events/${event.slug}`}>
                <div className={cn(
                  'ml-28 md:ml-0 md:w-[calc(50%-4rem)]',
                  isEven ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'
                )}>
                  <div className="group relative bg-card rounded-2xl border border-border shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-1">
                    {/* Date badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className={cn(
                        'text-xs font-bold border-2',
                        statusColors[event.status]
                      )}>
                        {statusLabels[event.status]}
                      </Badge>
                    </div>

                    {/* Cover image */}
                    {event.cover_image_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={event.cover_image_url}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className={cn(
                        'relative h-48 flex items-center justify-center overflow-hidden',
                        gradientClass
                      )}>
                        {/* Show photo mosaic if posts available, otherwise show icon */}
                        {posts && posts.length > 0 ? (
                          <EventPhotoMosaic posts={posts} maxPhotos={9} />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-white/90" />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Title */}
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      {/* Description */}
                      {event.description && (
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {formatDateRange(event.start_date, event.end_date)}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <div className={cn('p-2 rounded-lg', gradientClass)}>
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-lg font-bold">{event.total_photos}</div>
                            <div className="text-xs text-muted-foreground">ảnh</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={cn('p-2 rounded-lg', gradientClass)}>
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-lg font-bold">{event.total_contributors}</div>
                            <div className="text-xs text-muted-foreground">người</div>
                          </div>
                        </div>

                        <div className="ml-auto">
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none',
                      gradientClass
                    )} />
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
