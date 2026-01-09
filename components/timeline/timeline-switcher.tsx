'use client'

import { useState } from 'react'
import type { Event, Post } from '@/lib/types'
import { MemoryRiverTimeline } from './memory-river-timeline'
import { StoryReelTimeline } from './story-reel-timeline'
import { TimelineViewToggle } from './timeline-view-toggle'

interface TimelineSwitcherProps {
  events: { event: Event; posts: Post[] }[]
}

/**
 * TimelineSwitcher - Toggle between Memory River and Story Reel views
 */
export function TimelineSwitcher({ events }: TimelineSwitcherProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'story'>('timeline')

  const handleToggle = (mode: 'timeline' | 'story') => {
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

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <MemoryRiverTimeline events={events} />
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
