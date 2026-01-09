'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import Hammer from 'hammerjs'
import { cn } from '@/lib/utils'

interface GesturePhotoViewerProps {
  src: string
  alt: string
  blurhash?: string | null
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeDown?: () => void
  className?: string
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2.5
const SWIPE_THRESHOLD = 80
const SWIPE_VELOCITY = 0.3

export function GesturePhotoViewer({
  src,
  alt,
  blurhash,
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  className,
}: GesturePhotoViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Motion values for smooth animations
  const opacity = useMotionValue(1)
  const translateY = useMotionValue(0)
  const backdropOpacity = useTransform(translateY, [0, 200], [1, 0])

  // Track gesture state
  const gestureState = useRef({
    lastScale: 1,
    lastX: 0,
    lastY: 0,
    isPinching: false,
  })

  const resetTransform = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsZoomed(false)
    animate(translateY, 0, { type: 'spring', stiffness: 300, damping: 30 })
    animate(opacity, 1, { duration: 0.2 })
    gestureState.current = { lastScale: 1, lastX: 0, lastY: 0, isPinching: false }
  }, [opacity, translateY])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const hammer = new Hammer(container, {
      touchAction: 'none',
    })

    // Enable pinch and pan recognizers
    hammer.get('pinch').set({ enable: true })
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL })

    // Pinch to zoom
    hammer.on('pinchstart', () => {
      gestureState.current.isPinching = true
      gestureState.current.lastScale = scale
    })

    hammer.on('pinchmove', (e) => {
      if (prefersReducedMotion) return
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, gestureState.current.lastScale * e.scale))
      setScale(newScale)
      setIsZoomed(newScale > 1.1)
    })

    hammer.on('pinchend', () => {
      gestureState.current.lastScale = scale
      gestureState.current.isPinching = false
      if (scale < 1.1) resetTransform()
    })

    // Double tap to zoom
    hammer.on('doubletap', (e) => {
      if (prefersReducedMotion) {
        // Instant toggle for reduced motion
        if (isZoomed) {
          resetTransform()
        } else {
          setScale(DOUBLE_TAP_SCALE)
          setIsZoomed(true)
        }
        return
      }

      if (isZoomed) {
        resetTransform()
      } else {
        // Zoom to tap point
        const rect = container.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const tapX = e.center.x - rect.left
        const tapY = e.center.y - rect.top

        setScale(DOUBLE_TAP_SCALE)
        setPosition({
          x: (centerX - tapX) * (DOUBLE_TAP_SCALE - 1),
          y: (centerY - tapY) * (DOUBLE_TAP_SCALE - 1),
        })
        setIsZoomed(true)
      }
    })

    // Pan when zoomed
    hammer.on('panstart', () => {
      gestureState.current.lastX = position.x
      gestureState.current.lastY = position.y
    })

    hammer.on('panmove', (e) => {
      if (isZoomed) {
        // Pan the zoomed image
        setPosition({
          x: gestureState.current.lastX + e.deltaX,
          y: gestureState.current.lastY + e.deltaY,
        })
      } else {
        // Track vertical drag for dismiss gesture
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          translateY.set(e.deltaY)
          setIsDragging(true)
        }
      }
    })

    hammer.on('panend', (e) => {
      setIsDragging(false)
      if (gestureState.current.isPinching) return

      // Swipe gestures when not zoomed
      if (!isZoomed) {
        const velocity = Math.abs(e.velocity)
        const isSwipe = velocity > SWIPE_VELOCITY

        if (isSwipe) {
          if (e.direction === Hammer.DIRECTION_LEFT) {
            onSwipeLeft?.()
          } else if (e.direction === Hammer.DIRECTION_RIGHT) {
            onSwipeRight?.()
          } else if (e.direction === Hammer.DIRECTION_DOWN && e.deltaY > SWIPE_THRESHOLD) {
            animate(translateY, 300, { duration: 0.2 })
            animate(opacity, 0, { duration: 0.2 })
            setTimeout(() => onSwipeDown?.(), 200)
            return
          }
        }
        // Spring back if not dismissed
        animate(translateY, 0, { type: 'spring', stiffness: 300, damping: 30 })
      }
    })

    return () => {
      hammer.destroy()
    }
  }, [scale, position, isZoomed, onSwipeLeft, onSwipeRight, onSwipeDown, resetTransform, translateY, opacity])

  const transformStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
    transition: gestureState.current.isPinching || isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }

  return (
    <motion.div
      ref={containerRef}
      style={{ y: translateY, opacity }}
      className={cn(
        'relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none',
        className
      )}
    >
      <motion.div
        style={transformStyle}
        className="will-change-transform"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
          placeholder={blurhash ? 'blur' : 'empty'}
          blurDataURL={blurhash || undefined}
          draggable={false}
        />
      </motion.div>
    </motion.div>
  )
}
