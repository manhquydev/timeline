'use client'

import { useScroll, useSpring, useTransform, MotionValue } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Custom hook to track scroll progress for timeline and other scroll-driven animations
 * Uses framer-motion's useScroll for high-performance off-main-thread tracking where possible
 */
export function useScrollProgress() {
  const { scrollYProgress } = useScroll()

  // Use a spring for smoother progress updates
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Simple state to track if we're scrolling (useful for performance optimizations)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const unsubscribe = scrollYProgress.on('change', () => {
      setIsScrolling(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setIsScrolling(false), 150)
    })

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [scrollYProgress])

  return {
    progress: scrollYProgress,
    smoothProgress,
    isScrolling
  }
}
