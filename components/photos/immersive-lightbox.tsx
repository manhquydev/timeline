'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GesturePhotoViewer } from './gesture-photo-viewer'
import { LightboxControls } from './lightbox-controls'
import type { Post } from '@/lib/types'

interface ImmersiveLightboxProps {
  photos: Post[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
  userId?: string
  onLike?: () => void
  onShare?: () => void
  onDownload?: () => void
  onCommentClick?: () => void
  /** Optional layoutId for shared element transition */
  layoutId?: string
}

export function ImmersiveLightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  userId,
  onLike,
  onShare,
  onDownload,
  onCommentClick,
  layoutId,
}: ImmersiveLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showMetadata, setShowMetadata] = useState(true)
  const currentPhoto = photos[currentIndex]

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (currentIndex > 0) onNavigate(currentIndex - 1)
          break
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1)
  }, [currentIndex, photos.length, onNavigate])

  const handleSwipeRight = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1)
  }, [currentIndex, onNavigate])

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Hide metadata after 3 seconds of inactivity
  useEffect(() => {
    if (!isOpen) return
    setShowMetadata(true)
    const timer = setTimeout(() => setShowMetadata(false), 3000)
    return () => clearTimeout(timer)
  }, [isOpen, currentIndex])

  // Show metadata on any interaction
  const handleInteraction = useCallback(() => {
    setShowMetadata(true)
  }, [])

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const contentVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }

  const metadataVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  }

  if (!currentPhoto) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[2000] flex flex-col"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onMouseMove={handleInteraction}
          onTouchStart={handleInteraction}
        >
          {/* Dark backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Close button */}
          <motion.button
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4 z-10 p-3 rounded-full',
              'bg-white/10 backdrop-blur-md text-white',
              'hover:bg-white/20 transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-white/50',
              'min-w-[48px] min-h-[48px] flex items-center justify-center',
              'shadow-lg shadow-black/20'
            )}
            aria-label="Close lightbox"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Photo metadata overlay */}
          <AnimatePresence>
            {showMetadata && (
              <motion.div
                className="absolute top-4 left-4 z-10 max-w-[60%]"
                variants={metadataVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
              >
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 space-y-1.5">
                  {currentPhoto.user_name && (
                    <div className="flex items-center gap-2 text-white/90">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{currentPhoto.user_name}</span>
                    </div>
                  )}
                  {currentPhoto.uploaded_at && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {new Date(currentPhoto.uploaded_at).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main photo area */}
          <motion.div
            className="relative flex-1 min-h-0 flex items-center justify-center p-4 pb-32"
            variants={contentVariants}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            layoutId={layoutId}
          >
            {currentPhoto.media_type === 'video' ? (
              <video
                src={currentPhoto.media_url}
                poster={currentPhoto.thumbnail_url || undefined}
                className="max-w-full max-h-full object-contain rounded-lg"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <GesturePhotoViewer
                src={currentPhoto.media_url}
                fallbackSrc={currentPhoto.thumbnail_url}
                alt={currentPhoto.wish_text || 'Photo'}
                blurhash={currentPhoto.blurhash}
                originalWidth={currentPhoto.dimensions?.width}
                originalHeight={currentPhoto.dimensions?.height}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeDown={onClose}
              />
            )}
          </motion.div>

          {/* Caption overlay */}
          <AnimatePresence>
            {currentPhoto.wish_text && showMetadata && (
              <motion.div
                className="absolute bottom-36 left-0 right-0 px-4 z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 max-w-2xl mx-auto">
                  <p className="text-white/90 text-center text-sm md:text-base font-medium line-clamp-3">
                    &quot;{currentPhoto.wish_text}&quot;
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <LightboxControls
            photo={currentPhoto}
            currentIndex={currentIndex}
            total={photos.length}
            userId={userId}
            onDownload={onDownload}
            onShare={onShare}
            onLike={onLike}
            onCommentClick={onCommentClick}
            onPrev={currentIndex > 0 ? () => onNavigate(currentIndex - 1) : undefined}
            onNext={currentIndex < photos.length - 1 ? () => onNavigate(currentIndex + 1) : undefined}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
