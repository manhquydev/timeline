'use client'

import { useState } from 'react'
import type { Event, Post } from '@/lib/types'
import { MemoryRiverTimeline } from './memory-river-timeline'
import { StoryReelTimeline } from './story-reel-timeline'
import { BentoGridTimeline } from './bento-grid-timeline'
import { CarouselTimeline } from './carousel-timeline'
import { CalendarTimeline } from './calendar-timeline'
import { TimelineViewToggle, type TimelineViewMode } from './timeline-view-toggle'

interface TimelineSwitcherProps {
  events: { event: Event; posts: Post[] }[]
}

/**
 * TimelineSwitcher - Toggle between multiple timeline views
 * Views: Timeline, Story, Grid, Carousel, Calendar
 */
export function TimelineSwitcher({ events }: TimelineSwitcherProps) {
  const [viewMode, setViewMode] = useState<TimelineViewMode>('calendar')

  const handleToggle = (mode: TimelineViewMode) => {
    setViewMode(mode)
  }

  const handleCloseStory = () => {
    setViewMode('timeline')
  }

  return (
    <>
      {/* View Toggle */}
      <div className="flex justify-center mb-8">
        <TimelineViewToggle
          currentMode={viewMode}
          onToggle={handleToggle}
        />
      </div>

      {/* Timeline View (default) */}
      {viewMode === 'timeline' && (
        <MemoryRiverTimeline events={events} />
      )}

      {/* Bento Grid View */}
      {viewMode === 'grid' && (
        <BentoGridTimeline events={events} />
      )}

      {/* Carousel View */}
      {viewMode === 'carousel' && (
        <CarouselTimeline events={events} />
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <CalendarTimeline events={events} />
      )}

      {/* Story Reel View (fullscreen overlay) */}
      {viewMode === 'story' && (
        <StoryReelTimeline
          events={events}
          onClose={handleCloseStory}
        />
      )}
    </>
  )
}
