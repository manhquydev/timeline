'use client'

/**
 * Lazy Video Component
 * High-performance video component with:
 * - Lazy loading via IntersectionObserver (only loads when in viewport)
 * - Thumbnail poster support
 * - Hover/touch to play
 * - Debounced play/pause to prevent rapid toggling
 * - Mobile-optimized (no autoplay on mobile to save data)
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface LazyVideoProps {
  src: string
  poster?: string | null
  className?: string
  aspectRatio?: 'video' | 'square' | 'auto' | 'portrait'
  showControls?: boolean
  autoPlayOnHover?: boolean
  muted?: boolean
  loop?: boolean
  onClick?: () => void
}

export function LazyVideo({
  src,
  poster,
  className,
  aspectRatio = 'video',
  showControls = false,
  autoPlayOnHover = true,
  muted = true,
  loop = true,
  onClick,
}: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [showPlayButton, setShowPlayButton] = useState(true)
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if mobile device
  const isMobile = typeof window !== 'undefined' && (
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  )

  // Intersection Observer for lazy loading
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect() // Only need to detect once
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0,
      }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Debounced play function
  const handlePlay = useCallback(() => {
    if (!videoRef.current || !isLoaded) return

    // Clear any pending pause
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current)
      playTimeoutRef.current = null
    }

    videoRef.current.play().catch(() => {
      // Autoplay blocked, show play button
      setShowPlayButton(true)
    })
    setIsPlaying(true)
    setShowPlayButton(false)
  }, [isLoaded])

  // Debounced pause function
  const handlePause = useCallback(() => {
    // Delay pause slightly to prevent flicker on rapid mouse movements
    playTimeoutRef.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
        setShowPlayButton(true)
      }
    }, 150)
  }, [])

  // Handle hover events (desktop only)
  const handleMouseEnter = useCallback(() => {
    if (!isMobile && autoPlayOnHover) {
      handlePlay()
    }
  }, [isMobile, autoPlayOnHover, handlePlay])

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && autoPlayOnHover) {
      handlePause()
    }
  }, [isMobile, autoPlayOnHover, handlePause])

  // Handle click/tap
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
      return
    }

    // Toggle play on mobile, or when controls are shown
    if (isMobile || showControls) {
      if (isPlaying) {
        if (videoRef.current) {
          videoRef.current.pause()
          setIsPlaying(false)
          setShowPlayButton(true)
        }
      } else {
        handlePlay()
      }
    }
  }, [onClick, isMobile, showControls, isPlaying, handlePlay])

  // Toggle mute
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current)
      }
    }
  }, [])

  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    auto: 'aspect-auto',
    portrait: 'aspect-[3/4]',
  }[aspectRatio]

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-black',
        aspectClass,
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Poster/Thumbnail - shown until video loads and plays */}
      {poster && (!isLoaded || !isPlaying) && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Video element - only render when in viewport */}
      {isInView && (
        <video
          ref={videoRef}
          src={src}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded && isPlaying ? 'opacity-100' : 'opacity-0'
          )}
          muted={isMuted}
          loop={loop}
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          onPlay={() => {
            setIsPlaying(true)
            setShowPlayButton(false)
          }}
          onPause={() => {
            setIsPlaying(false)
            setShowPlayButton(true)
          }}
        />
      )}

      {/* Play button overlay */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={cn(
            'w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center',
            'border-2 border-white/30 transition-transform duration-200',
            'group-hover:scale-110'
          )}>
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Video controls (optional) */}
      {showControls && isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isInView && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

/**
 * Simple video thumbnail component
 * Shows poster with play button, clicks to open full video
 */
export function VideoThumbnail({
  poster,
  className,
  onClick,
}: {
  poster?: string | null
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-black cursor-pointer group',
        className
      )}
      onClick={onClick}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-muted" />
      )}

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          'w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center',
          'border-2 border-white/30 transition-transform duration-200',
          'group-hover:scale-110 group-hover:bg-black/70'
        )}>
          <Play className="w-6 h-6 text-white ml-1" fill="white" />
        </div>
      </div>
    </div>
  )
}
