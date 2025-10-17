'use client'

import { useState } from 'react'
import type { Event, Post } from '@/lib/types'
import { VerticalTimeline } from './vertical-timeline'
import { MemoryRiverTimeline } from './memory-river-timeline'
import { Button } from '@/components/ui/button'
import { Sparkles, List } from 'lucide-react'

interface TimelineSwitcherProps {
  events: { event: Event; posts: Post[] }[]
}

export function TimelineSwitcher({ events }: TimelineSwitcherProps) {
  const [useNewTimeline, setUseNewTimeline] = useState(true)

  return (
    <div>
      {/* Toggle button */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-2xl p-1 glass-gradient shadow-lg">
          <Button
            onClick={() => setUseNewTimeline(false)}
            variant={!useNewTimeline ? 'default' : 'ghost'}
            className={`
              rounded-xl px-6 py-3 font-bold transition-all duration-300
              ${!useNewTimeline ? 'gradient-1 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            <List className="w-5 h-5 mr-2" />
            Timeline Cũ
          </Button>
          <Button
            onClick={() => setUseNewTimeline(true)}
            variant={useNewTimeline ? 'default' : 'ghost'}
            className={`
              rounded-xl px-6 py-3 font-bold transition-all duration-300
              ${useNewTimeline ? 'gradient-animated text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Memory River
          </Button>
        </div>
      </div>

      {/* Timeline display */}
      <div className="transition-all duration-500">
        {useNewTimeline ? (
          <MemoryRiverTimeline events={events} />
        ) : (
          <VerticalTimeline events={events} />
        )}
      </div>
    </div>
  )
}
