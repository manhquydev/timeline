'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { Calendar, Image as ImageIcon, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CarouselTimelineProps {
  events: { event: Event; posts: Post[] }[]
}

const statusLabels: Record<string, string> = {
  draft: 'Nháp',
  open: 'Đang Mở',
  closed: 'Đã Đóng',
  archived: 'Lưu Trữ'
}

/**
 * CarouselTimeline - Netflix/Apple style horizontal scroll
 * Features:
 * - Horizontal scroll with snap
 * - Large feature cards
 * - Arrow navigation
 * - Parallax-like depth on scroll
 */
export function CarouselTimeline({ events }: CarouselTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
  )

  const gradientClasses = ['from-violet-600', 'from-rose-600', 'from-blue-600', 'from-amber-600', 'from-emerald-600']

  const getCoverImage = (event: Event, posts: Post[]) => {
    if (event.cover_image_url) return event.cover_image_url
    if (posts.length > 0) return posts[0].media_url
    return null
  }

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <div className="relative -mx-4 md:-mx-8">
      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-20',
          'w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm shadow-lg',
          'hover:bg-background hover:scale-110',
          'disabled:opacity-0 disabled:pointer-events-none',
          'transition-all duration-300',
          'hidden md:flex'
        )}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 z-20',
          'w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm shadow-lg',
          'hover:bg-background hover:scale-110',
          'disabled:opacity-0 disabled:pointer-events-none',
          'transition-all duration-300',
          'hidden md:flex'
        )}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={cn(
          'flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory',
          'px-4 md:px-8 py-4',
          'scrollbar-hide',
          '-webkit-overflow-scrolling: touch'
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sortedEvents.map(({ event, posts }, index) => {
          const coverImage = getCoverImage(event, posts)
          const gradientClass = gradientClasses[index % gradientClasses.length]

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className="flex-shrink-0 snap-center first:pl-0 last:pr-4"
            >
              <Link href={`/events/${event.slug}`}>
                <div className={cn(
                  'group relative w-[280px] md:w-[400px] aspect-[4/5] rounded-3xl overflow-hidden',
                  'shadow-2xl hover:shadow-3xl',
                  'transition-all duration-500',
                  'hover:scale-[1.03]',
                  'transform-gpu'
                )}>
                  {/* Background */}
                  {coverImage ? (
                    <Image
                      src={coverImage}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-br to-black',
                      gradientClass
                    )} />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 font-semibold">
                      {statusLabels[event.status]}
                    </Badge>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-6 space-y-4">
                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">
                      {event.title}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p className="text-white/80 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-white/90">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {formatDateRange(event.start_date, event.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <ImageIcon className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-semibold">{event.total_photos}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <Users className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-semibold">{event.total_contributors}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500',
                    `bg-gradient-to-t ${gradientClass} to-transparent`
                  )} />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Scroll Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {sortedEvents.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!scrollRef.current) return
              const cardWidth = scrollRef.current.clientWidth * 0.8
              scrollRef.current.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
              })
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              'bg-primary/30 hover:bg-primary/60'
            )}
          />
        ))}
      </div>
    </div>
  )
}
