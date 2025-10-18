/**
 * Global Progress Bar Component
 * Shows at top of page during route transitions
 */

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function GlobalProgressBar() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Show progress bar when route changes
    setIsLoading(true)
    setProgress(10)

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(40), 100)
    const timer2 = setTimeout(() => setProgress(70), 300)
    const timer3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setIsLoading(false), 200)
    }, 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-1 gradient-1 transition-all duration-300 ease-out origin-left",
        progress === 100 && "opacity-0"
      )}
      style={{
        transform: `scaleX(${progress / 100})`,
      }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
    </div>
  )
}

// Inline progress bar for specific actions
interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
  message?: string
}

export function ProgressBar({ progress, className, showPercentage = false, message }: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {(message || showPercentage) && (
        <div className="flex items-center justify-between text-fluid-sm">
          {message && <span className="font-medium">{message}</span>}
          {showPercentage && (
            <span className="font-bold gradient-1 bg-clip-text text-transparent">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full gradient-1 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
