'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { Calendar, Image as ImageIcon, Users, ChevronUp, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useStoryModeStore } from '@/lib/stores/story-mode-store'

interface StoryReelTimelineProps {
  events: { event: Event; posts: Post[] }[]
  onClose?: () => void
}

/**
 * StoryReelTimeline - Full-screen swipe timeline like TikTok/Stories
 * Features:
 * - Vertical swipe navigation between events
 * - Horizontal tap navigation between photos within event
 * - Full-screen immersive photos
 * - Per-photo progress indicators
 * - Gesture-based interaction
 */
export function StoryReelTimeline({ events, onClose }: StoryReelTimelineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [photoIndexMap, setPhotoIndexMap] = useState<Record<number, number>>({})
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const y = useMotionValue(0)

  const { setStoryMode } = useStoryModeStore()

  // Set story mode on mount, clear on unmount
  useEffect(() => {
    setStoryMode(true)
    return () => setStoryMode(false)
  }, [setStoryMode])

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
  )

  const currentEvent = sortedEvents[currentIndex]
  const currentPhotos = useMemo(() => currentEvent?.posts ?? [], [currentEvent?.posts])
  const currentPhotoIndex = photoIndexMap[currentIndex] ?? 0
  const currentPhoto = currentPhotos[currentPhotoIndex]

  // Navigate to next/prev event
  const goToEvent = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= sortedEvents.length) return
    setDirection(newIndex > currentIndex ? 1 : -1)
    setCurrentIndex(newIndex)
  }, [currentIndex, sortedEvents.length])

  const goNext = useCallback(() => goToEvent(currentIndex + 1), [currentIndex, goToEvent])
  const goPrev = useCallback(() => goToEvent(currentIndex - 1), [currentIndex, goToEvent])

  // Navigate to specific photo within current event
  const goToPhoto = useCallback((photoIdx: number) => {
    const maxIdx = currentPhotos.length - 1

    if (photoIdx < 0) {
      // At first photo, go to previous event (start at last photo)
      if (currentIndex > 0) {
        const prevEventPhotos = sortedEvents[currentIndex - 1]?.posts ?? []
        setPhotoIndexMap(prev => ({ ...prev, [currentIndex - 1]: prevEventPhotos.length - 1 }))
        goPrev()
      }
      return
    }

    if (photoIdx > maxIdx) {
      // At last photo, go to next event (start at first photo)
      if (currentIndex < sortedEvents.length - 1) {
        setPhotoIndexMap(prev => ({ ...prev, [currentIndex + 1]: 0 }))
        goNext()
      }
      return
    }

    setPhotoIndexMap(prev => ({ ...prev, [currentIndex]: photoIdx }))
  }, [currentPhotos.length, currentIndex, goNext, goPrev, sortedEvents])

  const goNextPhoto = useCallback(() => goToPhoto(currentPhotoIndex + 1), [currentPhotoIndex, goToPhoto])
  const goPrevPhoto = useCallback(() => goToPhoto(currentPhotoIndex - 1), [currentPhotoIndex, goToPhoto])

  // Auto-advance timer (5s per photo)
  useEffect(() => {
    if (isPaused || currentPhotos.length === 0) return

    timerRef.current = setTimeout(() => {
      goNextPhoto()
    }, 5000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, currentPhotoIndex, isPaused, goNextPhoto, currentPhotos.length])

  // Preload next photo
  useEffect(() => {
    const nextPhoto = currentPhotos[currentPhotoIndex + 1]
    if (nextPhoto?.media_url) {
      const img = new window.Image()
      img.src = nextPhoto.media_url
    }

    // Preload first photo of next event
    const nextEvent = sortedEvents[currentIndex + 1]
    if (nextEvent?.posts[0]?.media_url) {
      const img = new window.Image()
      img.src = nextEvent.posts[0].media_url
    }
  }, [currentPhotoIndex, currentPhotos, currentIndex, sortedEvents])

  // Handle swipe gestures (vertical only)
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

  // Long press handlers for pause
  const handlePressStart = useCallback(() => {
    setIsPaused(true)
  }, [])

  const handlePressEnd = useCallback(() => {
    setIsPaused(false)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') goNext()
      if (e.key === 'ArrowUp' || e.key === 'k') goPrev()
      if (e.key === 'ArrowLeft' || e.key === 'h') goPrevPhoto()
      if (e.key === 'ArrowRight' || e.key === 'l') goNextPhoto()
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, goNextPhoto, goPrevPhoto, onClose])

  // Get cover image for event (fallback if no posts)
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

  // Determine which image to show
  const displayImage = currentPhoto?.media_url || coverImage

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden touch-none"
    >
      {/* Per-photo progress indicators */}
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-3 pt-safe">
        {currentPhotos.length > 0 ? (
          // Show per-photo progress
          currentPhotos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToPhoto(idx)}
              className="flex-1 h-1 rounded-full overflow-hidden bg-white/30"
            >
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{
                  width: idx === currentPhotoIndex
                    ? (isPaused ? undefined : '100%')
                    : idx < currentPhotoIndex ? '100%' : '0%'
                }}
                transition={{
                  duration: idx === currentPhotoIndex && !isPaused ? 5 : 0.3
                }}
                style={idx === currentPhotoIndex && isPaused ? { animationPlayState: 'paused' } : undefined}
              />
            </button>
          ))
        ) : (
          // Fallback: single progress bar for event with no posts
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/30">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: isPaused ? undefined : '100%' }}
              transition={{ duration: isPaused ? 0 : 5 }}
            />
          </div>
        )}
      </div>

      {/* Close button */}
      <AnimatePresence>
        {!isPaused && onClose && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute top-12 right-4 z-30 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Event counter + Photo counter */}
      <AnimatePresence>
        {!isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 left-4 z-30 flex items-center gap-2"
          >
            <div className="px-3 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium backdrop-blur-sm">
              {currentIndex + 1} / {sortedEvents.length}
            </div>
            {currentPhotos.length > 1 && (
              <div className="px-3 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium backdrop-blur-sm">
                {currentPhotoIndex + 1} / {currentPhotos.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with swipe */}
      <motion.div
        className="absolute inset-0"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
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
            {/* Photo display with fade transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${currentPhotoIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {displayImage ? (
                  <>
                    <Image
                      src={displayImage}
                      alt={currentEvent.event.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
                  </>
                ) : (
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-br to-black',
                    gradientClass
                  )} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Event info overlay - hidden when paused */}
            <AnimatePresence>
              {!isPaused && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-safe"
                >
                  <div className="space-y-4">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation hints - hidden when paused */}
            <AnimatePresence>
              {!isPaused && (
                <>
                  {currentIndex > 0 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={goPrev}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200%] z-20 text-white/50 hover:text-white transition-colors animate-bounce"
                    >
                      <ChevronUp className="w-8 h-8" />
                    </motion.button>
                  )}
                  {currentIndex < sortedEvents.length - 1 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={goNext}
                      className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors animate-bounce"
                    >
                      <ChevronDown className="w-8 h-8" />
                    </motion.button>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Photo navigation tap zones (left/right 30%) */}
      <div
        className="absolute top-20 bottom-40 left-0 w-[30%] z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          goPrevPhoto()
        }}
      />
      <div
        className="absolute top-20 bottom-40 right-0 w-[30%] z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          goNextPhoto()
        }}
      />
    </div>
  )
}
