'use client'

import { motion } from 'framer-motion'
import { LayoutGrid, Play, Grid3X3, GalleryHorizontal, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TimelineViewMode = 'timeline' | 'story' | 'grid' | 'carousel' | 'calendar'

interface ViewOption {
  id: TimelineViewMode
  label: string
  icon: React.ReactNode
}

const VIEW_OPTIONS: ViewOption[] = [
  { id: 'timeline', label: 'Timeline', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'story', label: 'Story', icon: <Play className="w-4 h-4" /> },
  { id: 'grid', label: 'Grid', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'carousel', label: 'Carousel', icon: <GalleryHorizontal className="w-4 h-4" /> },
  { id: 'calendar', label: 'Lịch', icon: <Calendar className="w-4 h-4" /> },
]

interface TimelineViewToggleProps {
  onToggle: (mode: TimelineViewMode) => void
  currentMode: TimelineViewMode
}

/**
 * TimelineViewToggle - Switch between multiple timeline view modes
 * Modes: Timeline, Story, Grid, Carousel, Calendar
 */
export function TimelineViewToggle({ onToggle, currentMode }: TimelineViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-muted/80 backdrop-blur-sm border border-border/50 shadow-lg">
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => onToggle(option.id)}
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
            currentMode === option.id ? 'text-white' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {currentMode === option.id && (
            <motion.div
              layoutId="activeViewTab"
              className="absolute inset-0 bg-primary rounded-xl shadow-md"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{option.icon}</span>
          <span className="relative z-10 hidden md:inline">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
