'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NavBadgeProps {
  count: number
  className?: string
  maxCount?: number
}

export function NavBadge({ count, className, maxCount = 9 }: NavBadgeProps) {
  if (count <= 0) return null

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1',
        'flex items-center justify-center',
        'text-[10px] font-bold text-white',
        'bg-red-500 rounded-full shadow-sm',
        className
      )}
    >
      {displayCount}

      {/* Pulse animation ring */}
      <motion.span
        className="absolute inset-0 rounded-full bg-red-500"
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform, opacity' }}
      />
    </motion.span>
  )
}
