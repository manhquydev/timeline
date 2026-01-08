'use client'

import { useRef, useEffect, useState } from 'react'

/**
 * ScrollDrivenPath - SVG path that animates on scroll
 * Uses CSS scroll-timeline where supported, with JS fallback
 */
export function ScrollDrivenPath() {
  const pathRef = useRef<SVGPathElement>(null)
  const [supportsScrollTimeline, setSupportsScrollTimeline] = useState(false)

  useEffect(() => {
    // Check for CSS scroll-timeline support
    const hasSupport = typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()')
    setSupportsScrollTimeline(hasSupport)

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    if (!hasSupport && pathRef.current) {
      // JS fallback for unsupported browsers
      const path = pathRef.current
      const pathLength = path.getTotalLength()
      path.style.strokeDasharray = `${pathLength}`
      path.style.strokeDashoffset = `${pathLength}`

      const handleScroll = () => {
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight)
        const offset = pathLength * (1 - Math.min(scrollPercent * 1.5, 1))
        path.style.strokeDashoffset = `${offset}`
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Initial call
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [supportsScrollTimeline])

  return (
    <svg
      className="absolute left-8 md:left-1/2 top-0 h-full w-20 -translate-x-1/2 pointer-events-none"
      viewBox="0 0 80 1000"
      preserveAspectRatio="none"
      style={{ opacity: 0.7 }}
    >
      <defs>
        <linearGradient id="path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
        </linearGradient>
        <filter id="path-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Background dashed path */}
      <path
        d="M 40 0 Q 20 250 40 500 T 40 1000"
        stroke="hsl(var(--primary) / 0.15)"
        strokeWidth="2"
        strokeDasharray="8 4"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Animated fill path */}
      <path
        ref={pathRef}
        d="M 40 0 Q 20 250 40 500 T 40 1000"
        stroke="url(#path-gradient)"
        strokeWidth="3"
        fill="none"
        filter="url(#path-glow)"
        className={supportsScrollTimeline ? 'scroll-animate-path' : 'scroll-animate-path-fallback'}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
