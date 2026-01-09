'use client'

import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadProgressRingProps {
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { ring: 48, stroke: 4, icon: 16, text: 'text-xs' },
  md: { ring: 64, stroke: 5, icon: 24, text: 'text-sm' },
  lg: { ring: 80, stroke: 6, icon: 32, text: 'text-base' },
}

export function UploadProgressRing({
  progress,
  status,
  size = 'md',
  className,
}: UploadProgressRingProps) {
  const { ring, stroke, icon, text } = sizes[size]
  const radius = (ring - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={ring} height={ring} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-white/20"
        />
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(270 70% 50%)" />
            <stop offset="100%" stopColor="hsl(210 70% 60%)" />
          </linearGradient>
        </defs>
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : 'url(#progress-gradient)'}
          className="transition-all duration-300 ease-out"
          style={{ filter: status === 'uploading' ? 'drop-shadow(0 0 6px hsl(270 70% 50% / 0.5))' : undefined }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {status === 'success' ? (
          <CheckCircle2
            style={{ width: icon, height: icon }}
            className="text-green-500 animate-scale-in"
          />
        ) : status === 'error' ? (
          <XCircle
            style={{ width: icon, height: icon }}
            className="text-red-500 animate-scale-in"
          />
        ) : status === 'uploading' ? (
          <span className={cn('font-bold text-white', text)}>
            {Math.round(progress)}%
          </span>
        ) : (
          <RefreshCw style={{ width: icon * 0.7, height: icon * 0.7 }} className="text-white/60" />
        )}
      </div>
    </div>
  )
}
