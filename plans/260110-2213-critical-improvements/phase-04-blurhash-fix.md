# Phase 04: Blurhash Client-Side Decoding

## Context Links
- Parent: [plan.md](./plan.md)
- Scout: [scout-01-security-middleware.md](./scout/scout-01-security-middleware.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-10 |
| Priority | P1 - High |
| Effort | 1h |
| Implementation Status | pending |
| Review Status | pending |

Fix blurhash placeholder to decode actual blurhash string instead of static gray gradient.

## Key Insights

- Blurhash is encoded server-side in upload route using `blurhash` package
- Client component `optimized-image.tsx` has TODO comment for decoding
- Currently returns static SVG gradient instead of actual blur
- `blurhash` package already installed (used for encoding)

## Requirements

1. Import `decode` from blurhash package
2. Implement canvas-based blurhash decoding
3. Convert decoded pixels to data URL
4. Cache decoded blurhash to avoid re-computation
5. Fallback to gray gradient if decoding fails

## Architecture

```
blurhash string ──▶ decode() ──▶ Uint8ClampedArray ──▶ Canvas ──▶ DataURL
                                      (pixels)
```

## Related Code Files

- `components/ui/optimized-image.tsx` - Main implementation
- `package.json` - blurhash already installed

## Implementation Steps

### Step 1: Update optimized-image.tsx with real decoding
```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import { decode } from 'blurhash'
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

// Cache for decoded blurhash data URLs
const blurhashCache = new Map<string, string>()

/**
 * Decode blurhash to canvas data URL
 */
function decodeBlurhash(blurhash: string, width = 32, height = 32): string | null {
  // Check cache first
  const cacheKey = `${blurhash}-${width}-${height}`
  if (blurhashCache.has(cacheKey)) {
    return blurhashCache.get(cacheKey)!
  }

  try {
    // Decode blurhash to pixels
    const pixels = decode(blurhash, width, height)

    // Create canvas and draw pixels
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    const imageData = ctx.createImageData(width, height)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png')

    // Cache the result
    blurhashCache.set(cacheKey, dataUrl)

    return dataUrl
  } catch (error) {
    console.warn('Failed to decode blurhash:', error)
    return null
  }
}

/**
 * Fallback gradient placeholder
 */
const FALLBACK_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=='

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

  // Decode blurhash on client side
  const placeholderSrc = useMemo(() => {
    if (!blurhash || typeof window === 'undefined') {
      return FALLBACK_PLACEHOLDER
    }
    return decodeBlurhash(blurhash) || FALLBACK_PLACEHOLDER
  }, [blurhash])

  useEffect(() => {
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
      {/* Blur placeholder */}
      <img
        src={placeholderSrc}
        alt=""
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100 scale-110 blur-xl'
        )}
        aria-hidden="true"
      />

      {/* Actual image */}
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

      {/* Loading shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </div>
  )
}

// Background image variant
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

  const placeholderSrc = useMemo(() => {
    if (!blurhash || typeof window === 'undefined') {
      return FALLBACK_PLACEHOLDER
    }
    return decodeBlurhash(blurhash) || FALLBACK_PLACEHOLDER
  }, [blurhash])

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
```

### Step 2: Verify blurhash package exports decode
```typescript
// Test import in console or test file
import { decode, encode } from 'blurhash'
// decode should be available
```

### Step 3: Add unit test
```typescript
// components/ui/optimized-image.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OptimizedImage } from './optimized-image'

// Mock blurhash decode
vi.mock('blurhash', () => ({
  decode: vi.fn().mockReturnValue(new Uint8ClampedArray(32 * 32 * 4))
}))

describe('OptimizedImage', () => {
  it('renders with blurhash placeholder', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
      />
    )

    const images = screen.getAllByRole('img', { hidden: true })
    expect(images.length).toBeGreaterThan(0)
  })

  it('shows alt text on main image', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
      />
    )

    expect(screen.getByAltText('Test image')).toBeInTheDocument()
  })
})
```

## Todo List

- [ ] Update components/ui/optimized-image.tsx with decode logic
- [ ] Add blurhash cache to avoid re-computation
- [ ] Add error handling for invalid blurhash strings
- [ ] Write unit test for OptimizedImage
- [ ] Test with real images in browser
- [ ] Verify blur effect is visible during load

## Success Criteria

- [ ] Blurhash placeholder shows actual blur colors
- [ ] Cache prevents re-decoding same blurhash
- [ ] Fallback works when blurhash is null/invalid
- [ ] No visible jank during image load
- [ ] Works on mobile browsers

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Blurhash decode performance | Low | Low | Use small canvas (32x32) |
| Invalid blurhash strings | Medium | Low | Try-catch with fallback |
| SSR hydration mismatch | Medium | Medium | Check typeof window |

## Security Considerations

- No security concerns - client-side image processing only
- Blurhash strings are generated server-side (trusted)

## Next Steps

After completion:
1. Visual QA on different images
2. Proceed to Phase 05 (Admin Middleware)
3. Consider adding blurhash generation for existing images without it
