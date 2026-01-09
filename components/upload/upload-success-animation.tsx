'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface UploadSuccessAnimationProps {
  show: boolean
  onComplete?: () => void
  className?: string
}

const COLORS = ['#8B5CF6', '#A78BFA', '#10B981', '#FBBF24', '#F472B6', '#60A5FA']
const SHAPES = ['circle', 'square', 'triangle'] as const

export function UploadSuccessAnimation({
  show,
  onComplete,
  className,
}: UploadSuccessAnimationProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    shape: typeof SHAPES[number]
    style: React.CSSProperties
  }>>([])

  useEffect(() => {
    if (!show) {
      setParticles([])
      return
    }

    // Generate confetti burst particles
    const newParticles = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      style: {
        '--x': `${(Math.random() - 0.5) * 300}px`,
        '--y': `${Math.random() * -200 - 100}px`,
        '--rotate': `${Math.random() * 720 - 360}deg`,
        '--scale': Math.random() * 0.6 + 0.4,
        '--delay': `${Math.random() * 0.2}s`,
        left: `${40 + Math.random() * 20}%`,
        top: '50%',
        backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      } as React.CSSProperties,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => onComplete?.(), 2000)
    return () => clearTimeout(timer)
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-50 overflow-hidden', className)}>
      {particles.map(({ id, shape, style }) => (
        <div
          key={id}
          className={cn(
            'absolute w-3 h-3 animate-confetti-burst',
            shape === 'circle' && 'rounded-full',
            shape === 'square' && 'rounded-sm',
            shape === 'triangle' && 'clip-triangle'
          )}
          style={style}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-burst {
          0% { opacity: 1; transform: translateY(0) translateX(0) scale(var(--scale)) rotate(0deg); }
          100% { opacity: 0; transform: translateY(var(--y)) translateX(var(--x)) scale(0) rotate(var(--rotate)); }
        }
        .animate-confetti-burst { animation: confetti-burst 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; animation-delay: var(--delay); }
        .clip-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
      `}</style>
    </div>
  )
}
