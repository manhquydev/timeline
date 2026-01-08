'use client'

import { useRef, useEffect, useState } from 'react'
import { animate } from 'motion'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  end: number
  duration?: number
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
}

/**
 * AnimatedCounter - Number morphing animation component
 * Uses Motion One for high-performance WAAPI animations
 * Features:
 * - Eased number counting animation
 * - IntersectionObserver trigger (only animates when in view)
 * - Suffix/prefix support (e.g., "+", "K")
 * - Respects reduced motion preference
 */
export function AnimatedCounter({
  end,
  duration = 2,
  delay = 0,
  className,
  suffix = '',
  prefix = '',
}: AnimatedCounterProps) {
  const countRef = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!countRef.current || hasAnimated) return

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayValue(end)
      setHasAnimated(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          // Animate the counter
          const startTime = performance.now()
          const animationDuration = duration * 1000
          const delayMs = delay * 1000

          setTimeout(() => {
            const animateFrame = (currentTime: number) => {
              const elapsed = currentTime - startTime - delayMs
              const progress = Math.min(elapsed / animationDuration, 1)

              // Ease out cubic for smooth deceleration
              const eased = 1 - Math.pow(1 - progress, 3)
              const current = Math.round(eased * end)

              setDisplayValue(current)

              if (progress < 1) {
                requestAnimationFrame(animateFrame)
              }
            }

            requestAnimationFrame(animateFrame)
          }, delayMs)

          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(countRef.current)
    return () => observer.disconnect()
  }, [end, duration, delay, hasAnimated])

  // Format number with Vietnamese thousands separator
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString('vi-VN')
    }
    return num.toString()
  }

  return (
    <span ref={countRef} className={cn('tabular-nums', className)}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  )
}

/**
 * StatCard - Glass morphism stat card with animated counter
 */
interface StatCardProps {
  value: number
  label: string
  icon?: React.ReactNode
  delay?: number
  gradientClass?: string
  suffix?: string
}

export function StatCard({
  value,
  label,
  icon,
  delay = 0,
  gradientClass = 'gradient-1',
  suffix = '',
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!cardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!cardRef.current || !isVisible) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      cardRef.current.style.opacity = '1'
      cardRef.current.style.transform = 'none'
      return
    }

    animate(
      cardRef.current,
      {
        opacity: [0, 1],
        transform: ['translateY(20px) scale(0.95)', 'translateY(0) scale(1)']
      },
      {
        duration: 0.6,
        delay: delay,
        ease: [0.34, 1.56, 0.64, 1]
      }
    )
  }, [isVisible, delay])

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-3xl p-6 md:p-8',
        'bg-white/90 backdrop-blur-xl',
        'border border-white/50 shadow-2xl',
        'hover:-translate-y-2 hover:shadow-primary/20 transition-all duration-500',
        'group cursor-default',
        !isVisible && 'opacity-0'
      )}
    >
      {/* Gradient accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', gradientClass)} />

      {/* Hover glow effect */}
      <div className={cn(
        'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500',
        gradientClass
      )} />

      <div className="relative z-10 flex flex-col items-center text-center gap-3">
        {icon && (
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-2',
            gradientClass
          )}>
            {icon}
          </div>
        )}

        <AnimatedCounter
          end={value}
          duration={2.5}
          delay={delay + 0.3}
          suffix={suffix}
          className="text-4xl md:text-5xl font-black text-primary"
        />

        <div className="text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </div>
  )
}
