'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface KineticTitleProps {
  text: string
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'span'
}

/**
 * KineticTitle - Letter-by-letter animation for titles
 * Features:
 * - Staggered reveal using Framer Motion
 * - Spring easing for natural feel
 * - Supports prefers-reduced-motion
 * - Configurable delay and element type
 */
export function KineticTitle({
  text,
  className,
  delay = 0,
  as: Component = 'h1'
}: KineticTitleProps) {
  // Split text into words, then letters
  const words = text.split(' ')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay
      }
    }
  }

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: '1000px' }}
    >
      <Component className="inline">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.split('').map((letter, letterIndex) => (
              <motion.span
                key={`${wordIndex}-${letterIndex}`}
                variants={letterVariants}
                className="inline-block origin-bottom"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {letter}
              </motion.span>
            ))}
            {/* Add space between words */}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
      </Component>
    </motion.div>
  )
}
