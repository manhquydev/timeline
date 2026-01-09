'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
  threshold?: number
  disabled?: boolean
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const controls = useAnimation()

  const canPull = useCallback(() => {
    if (disabled || isRefreshing) return false
    return window.scrollY <= 0
  }, [disabled, isRefreshing])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canPull()) return
    startY.current = e.touches[0].clientY
  }, [canPull])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canPull() || startY.current === 0) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, (currentY - startY.current) * 0.5)

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }, [canPull, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15)
      }
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
    startY.current = 0
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / threshold, 1)
  const showIndicator = pullDistance > 10 || isRefreshing

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-30"
        style={{ top: -48 }}
        animate={{
          y: showIndicator ? pullDistance + 48 : 0,
          opacity: showIndicator ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-primary/20">
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : progress * 180 }}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          >
            <Loader2 className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-foreground">
            {isRefreshing ? 'Đang tải...' : progress >= 1 ? 'Thả để làm mới' : 'Kéo xuống để làm mới'}
          </span>
        </div>
      </motion.div>

      {/* Content with rubber-band effect */}
      <motion.div
        style={{ y: isRefreshing ? 48 : pullDistance * 0.3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
