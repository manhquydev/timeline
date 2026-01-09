'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineViewToggleProps {
  onToggle: (mode: 'timeline' | 'story') => void
  currentMode: 'timeline' | 'story'
}

/**
 * TimelineViewToggle - Switch between Timeline and Story Reel views
 */
export function TimelineViewToggle({ onToggle, currentMode }: TimelineViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 shadow-lg">
      <button
        onClick={() => onToggle('timeline')}
        className={cn(
          'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          currentMode === 'timeline' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {currentMode === 'timeline' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary rounded-full"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <LayoutGrid className="w-4 h-4 relative z-10" />
        <span className="relative z-10 hidden sm:inline">Timeline</span>
      </button>

      <button
        onClick={() => onToggle('story')}
        className={cn(
          'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          currentMode === 'story' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {currentMode === 'story' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary rounded-full"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Play className="w-4 h-4 relative z-10" />
        <span className="relative z-10 hidden sm:inline">Story</span>
      </button>
    </div>
  )
}
