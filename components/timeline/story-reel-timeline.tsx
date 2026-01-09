'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { Calendar, Image as ImageIcon, Users, ChevronUp, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface StoryReelTimelineProps {
  events: { event: Event; posts: Post[] }[]
  onClose?: () => void
}

/**
 * StoryReelTimeline - Full-screen swipe timeline like TikTok/Stories
 * Features:
 * - Vertical swipe navigation between events
 * - Full-screen immersive photos
 * - Progress indicators
 * - Gesture-based interaction
 */
export function StoryReelTimeline({ events, onClose }: StoryReelTimelineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
  )

  const currentEvent = sortedEvents[currentIndex]

  // Navigate to next/prev event
  const goToEvent = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= sortedEvents.length) return
    setDirection(newIndex > currentIndex ? 1 : -1)
    setCurrentIndex(newIndex)
  }, [currentIndex, sortedEvents.length])

  const goNext = useCallback(() => goToEvent(currentIndex + 1), [currentIndex, goToEvent])
  const goPrev = useCallback(() => goToEvent(currentIndex - 1), [currentIndex, goToEvent])

  // Handle swipe gestures
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    const velocity = info.velocity.y
    const offset = info.offset.y

    if (offset < -threshold || velocity < -500) {
      goNext()
    } else if (offset > threshold || velocity > 500) {
      goPrev()
    }
  }, [goNext, goPrev])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') goNext()
      if (e.key === 'ArrowUp' || e.key === 'k') goPrev()
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, onClose])

  // Get cover image for event
  const getCoverImage = (event: Event, posts: Post[]) => {
    if (event.cover_image_url) return event.cover_image_url
    if (posts.length > 0) return posts[0].media_url
    return null
  }

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      y: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    }),
  }

  if (!currentEvent) return null

  const coverImage = getCoverImage(currentEvent.event, currentEvent.posts)
  const gradientClasses = ['from-violet-600', 'from-rose-600', 'from-blue-600', 'from-amber-600', 'from-emerald-600']
  const gradientClass = gradientClasses[currentIndex % gradientClasses.length]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden touch-none"
    >
      {/* Progress indicators */}
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-3 pt-safe">
        {sortedEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToEvent(idx)}
            className="flex-1 h-1 rounded-full overflow-hidden bg-white/30"
          >
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: idx === currentIndex ? '100%' : idx < currentIndex ? '100%' : '0%' }}
              transition={{ duration: idx === currentIndex ? 5 : 0.3 }}
            />
          </button>
        ))}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-12 right-4 z-30 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Event counter */}
      <div className="absolute top-12 left-4 z-30 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium backdrop-blur-sm">
        {currentIndex + 1} / {sortedEvents.length}
      </div>

      {/* Main content with swipe */}
      <motion.div
        className="absolute inset-0"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {/* Background image or gradient */}
            {coverImage ? (
              <div className="absolute inset-0">
                <Image
                  src={coverImage}
                  alt={currentEvent.event.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
              </div>
            ) : (
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br to-black',
                gradientClass
              )} />
            )}

            {/* Photo count indicator */}
            {currentEvent.posts.length > 1 && (
              <div className="absolute top-20 right-4 z-20 flex flex-col gap-1">
                {currentEvent.posts.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'w-1.5 h-8 rounded-full',
                      idx === 0 ? 'bg-white' : 'bg-white/40'
                    )}
                  />
                ))}
                {currentEvent.posts.length > 5 && (
                  <span className="text-white/70 text-xs mt-1">+{currentEvent.posts.length - 5}</span>
                )}
              </div>
            )}

            {/* Event info overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-safe">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg leading-tight">
                  {currentEvent.event.title}
                </h2>

                {/* Description */}
                {currentEvent.event.description && (
                  <p className="text-white/80 text-base line-clamp-2 max-w-lg">
                    {currentEvent.event.description}
                  </p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {formatDateRange(currentEvent.event.start_date, currentEvent.event.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentEvent.event.total_photos} ảnh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentEvent.event.total_contributors} người</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className="w-full md:w-auto bg-white text-black hover:bg-white/90 font-bold text-base rounded-full shadow-xl"
                >
                  <Link href={`/events/${currentEvent.event.slug}`}>
                    Xem Sự Kiện
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Navigation hints */}
            {currentIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200%] z-20 text-white/50 hover:text-white transition-colors animate-bounce"
              >
                <ChevronUp className="w-8 h-8" />
              </button>
            )}
            {currentIndex < sortedEvents.length - 1 && (
              <button
                onClick={goNext}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors animate-bounce"
              >
                <ChevronDown className="w-8 h-8" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Side tap zones for navigation */}
      <div
        className="absolute top-20 bottom-40 left-0 w-1/4 z-10"
        onClick={goPrev}
      />
      <div
        className="absolute top-20 bottom-40 right-0 w-1/4 z-10"
        onClick={goNext}
      />
    </div>
  )
}
