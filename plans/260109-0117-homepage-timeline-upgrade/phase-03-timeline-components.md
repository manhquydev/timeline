# Phase 3: Timeline Components Upgrade

## Context
`MemoryRiverTimeline` (440 lines) currently uses IntersectionObserver + CSS transitions for reveals and a static SVG path. This phase refactors it with Motion One animations, scroll-driven SVG path animation, and improved mobile interactions.

## Overview
- Replace CSS transitions with Motion One `animate()`
- Implement scroll-driven SVG path animation (CSS + JS fallback)
- Add staggered reveal with configurable delays
- Improve mobile touch interactions (long-press peek)
- Extract reusable sub-components

## Key Insights
- Current: ~15 floating particles + orbiting particles per node = performance concern on mobile
- Research: Limit particles to 10 on mobile, use CSS transforms only
- SVG path should animate dash-offset on scroll for "drawing" effect
- Stagger interval: 50-100ms between items feels natural

## Requirements
- Maintain existing props interface (`events: { event: Event; posts: Post[] }[]`)
- 60fps animations on mid-range mobile (Snapdragon 600 series)
- Graceful degradation for `prefers-reduced-motion`
- No layout shifts during animation

## Implementation Steps

### 1. Create TimelineNode Component (components/timeline/timeline-node.tsx)
Extract node rendering for reusability:
```typescript
'use client'
import { useRef, useEffect } from 'react'
import { animate, spring } from 'motion'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineNodeProps {
  index: number
  isVisible: boolean
  gradientClass: string
}

export function TimelineNode({ index, isVisible, gradientClass }: TimelineNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!nodeRef.current || !isVisible) return

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      nodeRef.current.style.opacity = '1'
      nodeRef.current.style.transform = 'scale(1)'
      return
    }

    animate(
      nodeRef.current,
      { opacity: [0, 1], transform: ['scale(0.5) rotate(180deg)', 'scale(1) rotate(0deg)'] },
      { duration: 0.6, delay: index * 0.1, easing: spring({ stiffness: 300, damping: 20 }) }
    )
  }, [isVisible, index])

  return (
    <div ref={nodeRef} className={cn('timeline-node', gradientClass, !isVisible && 'opacity-0')}>
      <Calendar className="w-6 h-6 text-white" />
    </div>
  )
}
```

### 2. Create ScrollDrivenPath Component (components/timeline/scroll-driven-path.tsx)
SVG path that animates on scroll:
```typescript
'use client'
import { useRef, useEffect, useState } from 'react'

export function ScrollDrivenPath() {
  const pathRef = useRef<SVGPathElement>(null)
  const [supportsScrollTimeline, setSupportsScrollTimeline] = useState(false)

  useEffect(() => {
    // Check for CSS scroll-timeline support
    setSupportsScrollTimeline(CSS.supports('animation-timeline', 'scroll()'))

    if (!supportsScrollTimeline && pathRef.current) {
      // JS fallback for unsupported browsers
      const path = pathRef.current
      const pathLength = path.getTotalLength()
      path.style.strokeDasharray = `${pathLength}`
      path.style.strokeDashoffset = `${pathLength}`

      const handleScroll = () => {
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight)
        path.style.strokeDashoffset = `${pathLength * (1 - scrollPercent)}`
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [supportsScrollTimeline])

  return (
    <svg className="absolute left-8 md:left-1/2 top-0 h-full w-20 -translate-x-1/2 pointer-events-none" preserveAspectRatio="none">
      <defs>
        <linearGradient id="path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d="M 40 0 Q 20 25% 40 50% T 40 100%"
        stroke="url(#path-gradient)"
        strokeWidth="3"
        fill="none"
        className={supportsScrollTimeline ? 'scroll-animate-path' : 'scroll-animate-path-fallback'}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
```

### 3. Create EventCard Component (components/timeline/event-card.tsx)
Extract card rendering with Motion One animation:
```typescript
'use client'
import { useRef, useEffect } from 'react'
import { animate, spring } from 'motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { EventPhotoMosaic } from '../events/event-photo-mosaic'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: Event
  posts: Post[]
  index: number
  isVisible: boolean
  gradientClass: string
}

export function EventCard({ event, posts, index, isVisible, gradientClass }: EventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isEven = index % 2 === 0

  useEffect(() => {
    if (!cardRef.current || !isVisible) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      cardRef.current.style.opacity = '1'
      cardRef.current.style.transform = 'none'
      return
    }

    const initialRotate = isEven ? 'rotate(-3deg)' : 'rotate(3deg)'
    animate(
      cardRef.current,
      {
        opacity: [0, 1],
        transform: [`translateY(40px) scale(0.95) ${initialRotate}`, 'translateY(0) scale(1) rotate(0deg)']
      },
      { duration: 0.7, delay: index * 0.15, easing: spring({ stiffness: 200, damping: 20 }) }
    )
  }, [isVisible, index, isEven])

  return (
    <Link href={`/events/${event.slug}`}>
      <div
        ref={cardRef}
        className={cn(
          'glass-card overflow-hidden transition-shadow hover:shadow-xl',
          'hover:-translate-y-1',
          !isVisible && 'opacity-0'
        )}
      >
        {/* Cover image or mosaic */}
        <div className="relative h-48 md:h-56">
          {event.cover_image_url ? (
            <Image src={event.cover_image_url} alt={event.title} fill className="object-cover" />
          ) : posts.length > 0 ? (
            <EventPhotoMosaic posts={posts} maxPhotos={6} />
          ) : (
            <div className={cn('w-full h-full', gradientClass)} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="heading-card text-foreground">{event.title}</h3>
          {event.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDateRange(event.start_date, event.end_date)}</span>
            <span>{event.total_photos} photos</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

### 4. Refactor MemoryRiverTimeline (components/timeline/memory-river-timeline.tsx)
Compose new components:
```typescript
'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import type { Event, Post } from '@/lib/types'
import { ScrollDrivenPath } from './scroll-driven-path'
import { TimelineNode } from './timeline-node'
import { EventCard } from './event-card'
import { cn } from '@/lib/utils'

interface MemoryRiverTimelineProps {
  events: { event: Event; posts: Post[] }[]
}

export function MemoryRiverTimeline({ events }: MemoryRiverTimelineProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver for reveal triggers
  const observeItem = useCallback((el: HTMLElement | null, index: number) => {
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleItems(prev => new Set(prev).add(index))
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '50px' }
    )
    observer.observe(el)
  }, [])

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
  )

  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  if (events.length === 0) return null

  return (
    <div ref={containerRef} className="relative py-12 md:py-20">
      <ScrollDrivenPath />

      <div className="space-y-16 md:space-y-24">
        {sortedEvents.map(({ event, posts }, index) => {
          const gradientClass = gradientClasses[index % gradientClasses.length]
          const isVisible = visibleItems.has(index)
          const isEven = index % 2 === 0

          return (
            <div
              key={event.id}
              ref={el => observeItem(el, index)}
              className="relative"
            >
              {/* Node */}
              <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 z-10">
                <TimelineNode index={index} isVisible={isVisible} gradientClass={gradientClass} />
              </div>

              {/* Card */}
              <div className={cn(
                'ml-24 md:ml-0 md:w-[calc(50%-4rem)]',
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
    </div>
  )
}
```

### 5. Reduce Particle Count on Mobile
In any particle effects, add check:
```typescript
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
const particleCount = isMobile ? 8 : 15
```

### 6. Add Long-Press Peek (Optional Enhancement)
```typescript
// In EventCard, add touch handlers for "peek" preview
const [isPeeking, setIsPeeking] = useState(false)
const longPressTimer = useRef<NodeJS.Timeout>()

const handleTouchStart = () => {
  longPressTimer.current = setTimeout(() => setIsPeeking(true), 500)
}

const handleTouchEnd = () => {
  clearTimeout(longPressTimer.current)
  setIsPeeking(false)
}
```

## Todo
- [ ] Create `components/timeline/timeline-node.tsx`
- [ ] Create `components/timeline/scroll-driven-path.tsx`
- [ ] Create `components/timeline/event-card.tsx`
- [ ] Refactor `memory-river-timeline.tsx` to use new components
- [ ] Remove inline `<style jsx>` from old component
- [ ] Test scroll-driven path in Chrome vs Safari
- [ ] Verify 60fps on mobile DevTools

## Success Criteria
- [ ] Timeline path "draws" as user scrolls
- [ ] Cards animate in with staggered spring effect
- [ ] Nodes scale in with rotation
- [ ] Animations run at 60fps on mobile
- [ ] `prefers-reduced-motion` disables animations
- [ ] Component file sizes reduced (single responsibility)

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Safari scroll-timeline unsupported | High | Low | JS fallback already implemented |
| Motion One SSR issues | Medium | Medium | Use `'use client'` directive, check `typeof window` |
| Performance regression | Low | High | Profile with Chrome DevTools, limit particles |

## Files Modified
- `components/timeline/memory-river-timeline.tsx` - Refactor
- `components/timeline/timeline-node.tsx` - New
- `components/timeline/scroll-driven-path.tsx` - New
- `components/timeline/event-card.tsx` - New

## Dependencies
- Phase 1 (Motion One installed)
- Phase 2 (CSS utilities available)
