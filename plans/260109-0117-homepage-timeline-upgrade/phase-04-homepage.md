# Phase 4: Homepage Integration

## Context
`app/page.tsx` (267 lines) contains the homepage with Hero section, TimelineNav, and MemoryRiverTimeline. This phase integrates the upgraded components, refines the Hero section with new typography/animations, and adds optional "On This Day" widget.

## Overview
- Update Hero section with Be Vietnam Pro typography
- Replace CSS animations with Motion One for hero elements
- Integrate upgraded MemoryRiverTimeline
- Add "On This Day" widget (time permitting)
- Mobile-specific optimizations

## Key Insights
- Hero currently uses gradient-animated background with floating particles
- Research: Google Photos "Magazine Style" layout with bold typography works well
- "On This Day" widget drives high engagement (Facebook pattern)
- Hero CTA buttons already use glass-gradient; refine with subtle layering

## Requirements
- Hero loads within LCP budget (< 2.5s)
- Typography uses font-heading for titles
- Animations respect `prefers-reduced-motion`
- Mobile: reduce particle count, simplify animations

## Implementation Steps

### 1. Update Hero Typography (app/page.tsx)
Replace current title classes with new typography system:
```tsx
{/* Current */}
<h1 className="text-fluid-4xl font-black mb-6 animate-slide-in tracking-tight leading-tight">

{/* Updated */}
<h1 className="heading-hero mb-6 font-heading">
  <span className="block text-white drop-shadow-2xl">Timeline</span>
  <span className="block text-white/95">Teky Hoàng Mai</span>
</h1>
```

### 2. Create HeroSection Component (components/home/hero-section.tsx)
Extract Hero for cleaner page.tsx:
```typescript
'use client'
import { useRef, useEffect } from 'react'
import { animate, stagger, spring } from 'motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Camera, Plus, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  isAdmin: boolean
  hasEvents: boolean
  stats: { events: number; photos: number; contributors: number }
}

export function HeroSection({ isAdmin, hasEvents, stats }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Staggered entrance animation
    const elements = containerRef.current.querySelectorAll('[data-animate]')
    animate(
      elements,
      { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] },
      { duration: 0.6, delay: stagger(0.1), easing: spring({ stiffness: 200, damping: 20 }) }
    )
  }, [])

  // Particle count based on device
  const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : 10

  return (
    <div className="relative min-h-[85vh] flex items-center gradient-animated overflow-hidden">
      {/* Simplified blob elements - 2 instead of 4 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-[10%] w-72 h-72 md:w-96 md:h-96 bg-white/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 md:w-[400px] md:h-[400px] bg-white/12 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Reduced floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-float"
            style={{
              left: `${10 + (i * 80 / particleCount)}%`,
              top: `${20 + (i * 60 / particleCount)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + i}s`,
            }}
          />
        ))}
      </div>

      <div ref={containerRef} className="relative container mx-auto px-4 py-16 md:py-20 z-10">
        <div className="text-center text-white max-w-4xl mx-auto">
          {/* Icon */}
          <div data-animate className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 rounded-2xl glass-subtle">
            <Camera className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          </div>

          {/* Title */}
          <h1 data-animate className="heading-hero font-heading mb-4 md:mb-6">
            <span className="block text-white drop-shadow-2xl">Timeline</span>
            <span className="block text-white/95">Teky Hoàng Mai</span>
          </h1>

          {/* Subtitle */}
          <p data-animate className="text-fluid-lg md:text-fluid-xl mb-8 md:mb-10 text-white/90 max-w-2xl mx-auto font-body">
            Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ
          </p>

          {/* CTAs */}
          <div data-animate className="flex flex-wrap items-center justify-center gap-4">
            {isAdmin && (
              <Button asChild size="lg" className="glass-subtle text-primary font-semibold hover:bg-white/95">
                <Link href="/admin/events/create">
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo Sự Kiện
                </Link>
              </Button>
            )}
            {hasEvents && (
              <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link href="#events">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Khám Phá
                </Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          {hasEvents && (
            <div data-animate className="mt-12 md:mt-16 flex flex-wrap justify-center gap-4 md:gap-6">
              <StatCard value={stats.events} label="Sự Kiện" />
              <StatCard value={stats.photos} label="Khoảnh Khắc" />
              <StatCard value={stats.contributors} label="Người Tham Gia" />
            </div>
          )}
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 text-background">
        <svg viewBox="0 0 1440 100" fill="none" className="w-full h-auto">
          <path d="M0 100L60 88C120 76 240 52 360 44C480 36 600 44 720 52C840 60 960 68 1080 68C1200 68 1320 60 1380 56L1440 52V100H0Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass-subtle px-6 py-4 rounded-xl min-w-[120px]">
      <div className="text-fluid-2xl font-heading font-bold text-primary">{value}</div>
      <div className="text-sm font-medium text-primary/80">{label}</div>
    </div>
  )
}
```

### 3. Create OnThisDayWidget (components/home/on-this-day-widget.tsx)
Optional widget for engagement:
```typescript
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ChevronRight } from 'lucide-react'
import type { Event, Post } from '@/lib/types'

interface OnThisDayWidgetProps {
  events: { event: Event; posts: Post[] }[]
}

export function OnThisDayWidget({ events }: OnThisDayWidgetProps) {
  const [pastEvent, setPastEvent] = useState<{ event: Event; posts: Post[]; yearsAgo: number } | null>(null)

  useEffect(() => {
    const today = new Date()
    const todayMonth = today.getMonth()
    const todayDate = today.getDate()

    // Find event from same day in previous years
    const match = events.find(({ event }) => {
      const eventDate = new Date(event.event_date)
      return eventDate.getMonth() === todayMonth &&
             eventDate.getDate() === todayDate &&
             eventDate.getFullYear() < today.getFullYear()
    })

    if (match) {
      const yearsAgo = today.getFullYear() - new Date(match.event.event_date).getFullYear()
      setPastEvent({ ...match, yearsAgo })
    }
  }, [events])

  if (!pastEvent) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-card p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-semibold text-lg">
            {pastEvent.yearsAgo} năm trước
          </h3>
        </div>

        <Link href={`/events/${pastEvent.event.slug}`} className="group block">
          <div className="flex gap-4">
            {pastEvent.posts[0] && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={pastEvent.posts[0].thumbnail_url || pastEvent.posts[0].media_url}
                  alt={pastEvent.event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {pastEvent.event.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {pastEvent.event.description || `${pastEvent.event.total_photos} ảnh`}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </Link>
      </div>
    </div>
  )
}
```

### 4. Update page.tsx
Integrate new components:
```typescript
import { HeroSection } from '@/components/home/hero-section'
import { OnThisDayWidget } from '@/components/home/on-this-day-widget'
import { TimelineNav } from '@/components/timeline/timeline-nav'
import { MemoryRiverTimeline } from '@/components/timeline/memory-river-timeline'

export default async function Home() {
  // ... existing data fetching ...

  const stats = {
    events: eventsList.length,
    photos: eventsList.reduce((sum, e) => sum + e.total_photos, 0),
    contributors: eventsList.reduce((sum, e) => sum + e.total_contributors, 0),
  }

  return (
    <main className="min-h-screen">
      <HeroSection isAdmin={isAdmin} hasEvents={eventsList.length > 0} stats={stats} />

      {eventsList.length > 0 && (
        <>
          <TimelineNav events={eventsList} />
          <OnThisDayWidget events={events} />

          <section id="events" className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="heading-section font-heading text-foreground mb-3">
                Dòng thời gian
              </h2>
              <p className="text-muted-foreground text-fluid-base max-w-xl mx-auto">
                Hành trình kỷ niệm qua từng sự kiện đáng nhớ
              </p>
            </div>

            <MemoryRiverTimeline events={events} />
          </section>
        </>
      )}

      {/* Mobile FAB - simplified */}
      {isAdmin && eventsList.length > 0 && (
        <div className="fixed bottom-20 right-4 md:hidden z-50">
          <Button asChild size="icon" className="w-14 h-14 rounded-full shadow-xl gradient-1">
            <Link href="/admin/events/create">
              <Plus className="w-6 h-6 text-white" />
            </Link>
          </Button>
        </div>
      )}
    </main>
  )
}
```

### 5. Mobile Optimizations
Key changes for 80% mobile audience:
- Reduce hero particle count (10 → 6 on mobile)
- Simplify blob animations (2 blobs only)
- Use `min-h-[85vh]` instead of fixed heights
- Touch-optimized button sizes (44px minimum)
- Lazy load OnThisDayWidget images

## Todo
- [ ] Create `components/home/hero-section.tsx`
- [ ] Create `components/home/on-this-day-widget.tsx`
- [ ] Update `app/page.tsx` to use new components
- [ ] Remove deprecated inline styles from page.tsx
- [ ] Test on mobile viewport (375px, 414px)
- [ ] Verify LCP < 2.5s with PageSpeed Insights

## Success Criteria
- [ ] Hero animates smoothly with Motion One
- [ ] Typography uses font-heading and font-body
- [ ] Stats cards use glass-subtle styling
- [ ] OnThisDayWidget appears when matching event exists
- [ ] Mobile FAB positioned above MobileBottomNav
- [ ] LCP < 2.5s on mobile

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LCP regression | Medium | High | Defer non-critical animations, use `loading="lazy"` |
| OnThisDayWidget no matches | High | Low | Widget gracefully returns null |
| Hero too tall on small screens | Low | Medium | Use `min-h-[85vh]`, test on 320px width |

## Files Modified
- `app/page.tsx` - Refactor to use components
- `components/home/hero-section.tsx` - New
- `components/home/on-this-day-widget.tsx` - New

## Dependencies
- Phase 1-3 completed
