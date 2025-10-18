/**
 * Optimized Image Component with Blurhash Placeholder
 * Provides smooth loading experience with blur placeholder
 */

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  blurhash?: string | null
  aspectRatio?: string
  className?: string
  priority?: boolean
  onLoad?: () => void
}

/**
 * Simple blurhash to base64 data URL converter
 * This creates a small blurred preview image
 */
function blurhashToDataURL(blurhash: string | null | undefined): string {
  if (!blurhash) {
    // Return a simple gray gradient as fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=='
  }

  // For now, use a placeholder
  // In production, you would use the blurhash library to decode
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=='
}

export function OptimizedImage({
  src,
  alt,
  blurhash,
  aspectRatio = 'aspect-square',
  className,
  priority = false,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const placeholderSrc = blurhashToDataURL(blurhash)

  useEffect(() => {
    // Preload image if priority
    if (priority && src) {
      const img = new Image()
      img.src = src
      img.onload = () => {
        setIsLoaded(true)
        onLoad?.()
      }
      img.onerror = () => setHasError(true)
    }
  }, [src, priority, onLoad])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div className={cn('relative overflow-hidden', aspectRatio, className)}>
      {/* Blur placeholder - always shown, fades out when image loads */}
      <img
        src={placeholderSrc}
        alt=""
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100 scale-110 blur-xl'
        )}
        aria-hidden="true"
      />

      {/* Actual image - loads on top */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground text-sm">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Không thể tải ảnh</p>
          </div>
        </div>
      )}

      {/* Loading shimmer effect */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </div>
  )
}

// Variant for background images
export function OptimizedBackgroundImage({
  src,
  blurhash,
  className,
  children,
  priority = false,
}: {
  src: string
  blurhash?: string | null
  className?: string
  children?: React.ReactNode
  priority?: boolean
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const placeholderSrc = blurhashToDataURL(blurhash)

  useEffect(() => {
    if (priority && src) {
      const img = new Image()
      img.src = src
      img.onload = () => setIsLoaded(true)
    }
  }, [src, priority])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center transition-opacity duration-500 blur-xl scale-110',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        style={{ backgroundImage: `url(${placeholderSrc})` }}
      />

      {/* Actual background */}
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundImage: `url(${src})` }}
        onLoad={() => setIsLoaded(true)}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
