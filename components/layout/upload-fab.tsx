'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface UploadFABProps {
  className?: string
}

export function UploadFAB({ className }: UploadFABProps) {
  const pathname = usePathname()

  // Hide on pages that have a dedicated upload trigger
  const hiddenPaths = ['/upload', '/login', '/admin', '/moderator']
  const isEventDetailPage = /^\/events\/[^/]+\/?$/.test(pathname)
  const shouldHide = isEventDetailPage || hiddenPaths.some(path => pathname.startsWith(path))

  if (shouldHide) {
    return null
  }

  const handleClick = () => {
    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      className={cn(
        'fixed right-4 fab-bottom-primary z-40 md:hidden',
        className
      )}
    >
      <Link
        href="/upload"
        onClick={handleClick}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Tải ảnh lên"
      >
        {/* Gradient background */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary to-coral transition-transform duration-200 group-hover:scale-110 group-active:scale-95" />

        {/* Pulse animation ring */}
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform, opacity' }}
        />

        {/* Icon */}
        <Camera
          className="relative z-10 w-6 h-6 text-white transition-transform duration-200 group-hover:scale-110"
          strokeWidth={2.5}
        />
      </Link>
    </motion.div>
  )
}
