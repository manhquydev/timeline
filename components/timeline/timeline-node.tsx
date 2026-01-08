'use client'

import { useRef, useEffect } from 'react'
import { animate, type DOMKeyframesDefinition, type AnimationOptions } from 'motion'
import { Calendar, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/hooks/use-motion'

interface TimelineNodeProps {
  index: number
  isVisible: boolean
  gradientClass: string
}

/**
 * TimelineNode - Animated node marker for timeline events
 * Uses Motion One for performant spring animations
 */
export function TimelineNode({ index, isVisible, gradientClass }: TimelineNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!nodeRef.current || !isVisible) return

    // Respect reduced motion preference
    if (prefersReducedMotion()) {
      nodeRef.current.style.opacity = '1'
      nodeRef.current.style.transform = 'scale(1)'
      if (glowRef.current) {
        glowRef.current.style.opacity = '0.5'
        glowRef.current.style.transform = 'scale(1.5)'
      }
      return
    }

    // Animate main node with spring effect
    const nodeKeyframes: DOMKeyframesDefinition = {
      opacity: [0, 1],
      transform: ['scale(0.5) rotate(180deg)', 'scale(1) rotate(0deg)']
    }
    const nodeOptions: AnimationOptions = {
      duration: 0.6,
      delay: index * 0.1,
      ease: [0.34, 1.56, 0.64, 1]
    }
    animate(nodeRef.current, nodeKeyframes, nodeOptions)

    // Animate glow effect
    if (glowRef.current) {
      const glowKeyframes: DOMKeyframesDefinition = {
        opacity: [0, 0.6],
        transform: ['scale(0)', 'scale(1.5)']
      }
      const glowOptions: AnimationOptions = {
        duration: 0.7,
        delay: index * 0.1 + 0.2,
        ease: [0.34, 1.56, 0.64, 1]
      }
      animate(glowRef.current, glowKeyframes, glowOptions)
    }
  }, [isVisible, index])

  const sparklePositions = [
    { top: '0%', left: '50%' },
    { top: '100%', left: '50%' },
    { top: '50%', left: '0%' },
    { top: '50%', left: '100%' }
  ]

  return (
    <div className="relative group">
      {/* Outer glow ring */}
      <div
        ref={glowRef}
        className={cn(
          'absolute inset-0 rounded-full blur-xl opacity-0',
          gradientClass
        )}
        style={{ width: '80px', height: '80px' }}
      />

      {/* Main node */}
      <div
        ref={nodeRef}
        className={cn(
          'relative w-20 h-20 rounded-full flex items-center justify-center',
          'shadow-2xl transition-transform duration-300',
          'group-hover:scale-110',
          gradientClass,
          !isVisible && 'opacity-0'
        )}
      >
        <Calendar className="w-9 h-9 text-white drop-shadow-lg" />

        {/* Sparkle effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {sparklePositions.map((pos, i) => (
            <Sparkles
              key={i}
              className="absolute w-3 h-3 text-white animate-ping"
              style={{
                top: pos.top,
                left: pos.left,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Orbiting particles - only on desktop and when visible */}
      {isVisible && (
        <div className="hidden md:block">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn('absolute w-2 h-2 rounded-full', gradientClass)}
              style={{
                top: '50%',
                left: '50%',
                animation: 'orbit 3s linear infinite',
                animationDelay: `${i * 1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
