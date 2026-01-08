'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Event, Post } from '@/lib/types'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollDrivenPath } from './scroll-driven-path'
import { TimelineNode } from './timeline-node'
import { EventCard } from './event-card'
import { prefersReducedMotion } from '@/lib/hooks/use-motion'

interface MemoryRiverTimelineProps {
  events: { event: Event; posts: Post[] }[]
}

/**
 * MemoryRiverTimeline - Refactored with Motion One animations
 * Features:
 * - Scroll-driven SVG path animation
 * - Staggered reveal with spring physics
 * - Mobile-optimized particle count
 * - Accessibility: respects prefers-reduced-motion
 */
export function MemoryRiverTimeline({ events }: MemoryRiverTimelineProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observersRef = useRef<Map<number, IntersectionObserver>>(new Map())

  // Only render particles on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    // Capture ref value at effect creation time for cleanup
    const observers = observersRef.current
    return () => {
      // Cleanup all observers on unmount
      observers.forEach(observer => observer.disconnect())
      observers.clear()
    }
  }, [])

  // Observe item for reveal animation
  const observeItem = useCallback((el: HTMLElement | null, index: number) => {
    if (!el) return

    // Don't re-observe if already visible
    if (visibleItems.has(index)) return

    // Cleanup existing observer for this index
    const existingObserver = observersRef.current.get(index)
    if (existingObserver) {
      existingObserver.disconnect()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleItems(prev => new Set(prev).add(index))
          observer.disconnect()
          observersRef.current.delete(index)
        }
      },
      { threshold: 0.15, rootMargin: '50px' }
    )

    observer.observe(el)
    observersRef.current.set(index, observer)
  }, [visibleItems])

  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  if (events.length === 0) {
    return null
  }

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
  )

  // Mobile-optimized particle count
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const particleCount = isMobile ? 8 : 15

  // Check reduced motion preference
  const reducedMotion = prefersReducedMotion()

  return (
    <div ref={containerRef} className="relative py-12 md:py-20 overflow-hidden">
      {/* Animated background particles - optimized count */}
      {isMounted && !reducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(particleCount)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${(i * 17 + 5) % 100}%`,
                top: `${(i * 23 + 10) % 100}%`,
                animationDelay: `${(i * 0.5) % 5}s`,
                animationDuration: `${5 + (i % 5) * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Scroll-driven animated path */}
      <ScrollDrivenPath />

      <div className="space-y-16 md:space-y-24 relative">
        {sortedEvents.map(({ event, posts }, index) => {
          const gradientClass = gradientClasses[index % gradientClasses.length]
          const isEven = index % 2 === 0
          const isVisible = visibleItems.has(index)

          return (
            <div
              key={event.id}
              ref={el => observeItem(el, index)}
              className="relative"
            >
              {/* Timeline Node - Desktop */}
              <div className={cn(
                'absolute left-8 md:left-1/2 transform md:-translate-x-1/2 z-20',
                'hidden md:block'
              )}>
                <TimelineNode
                  index={index}
                  isVisible={isVisible}
                  gradientClass={gradientClass}
                />
              </div>

              {/* Mobile node - simplified */}
              <div className="absolute left-4 z-20 md:hidden">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center shadow-lg',
                  gradientClass,
                  'transition-all duration-500',
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                )}>
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
              </div>

              {/* Event Card */}
              <div className={cn(
                'ml-20 md:ml-0 md:w-[calc(50%-4rem)]',
                isEven ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
              )}>
                <EventCard
                  event={event}
                  posts={posts}
                  index={index}
                  isVisible={isVisible}
                  gradientClass={gradientClass}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* End of timeline indicator */}
      <div className={cn(
        'flex flex-col items-center justify-center mt-20 md:mt-32',
        !reducedMotion && 'animate-float'
      )}>
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-primary/50 rounded-full" />
          <Heart className="w-12 h-12 md:w-16 md:h-16 text-primary relative z-10 drop-shadow-2xl" />
        </div>
        <p className="mt-4 md:mt-6 text-muted-foreground font-semibold text-base md:text-lg">
          Hết dòng thời gian
        </p>
      </div>
    </div>
  )
}
