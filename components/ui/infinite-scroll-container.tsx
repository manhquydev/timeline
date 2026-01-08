'use client'

/**
 * Infinite Scroll Container
 * Wrapper component that handles infinite scroll detection
 * Uses IntersectionObserver for efficient scroll detection
 */

import { useRef, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollContainerProps {
  children: React.ReactNode
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  threshold?: number // pixels before end to trigger load
  className?: string
}

export function InfiniteScrollContainer({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 200,
  className = '',
}: InfiniteScrollContainerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore()
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, onLoadMore, threshold])

  return (
    <div className={className}>
      {children}

      {/* Sentinel element for intersection detection */}
      <div ref={sentinelRef} className="w-full h-1" aria-hidden="true" />

      {/* Loading indicator */}
      {isLoading && hasMore && (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải thêm...</span>
        </div>
      )}

      {/* End of content message */}
      {!hasMore && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Đã hiển thị tất cả ảnh
        </div>
      )}
    </div>
  )
}

/**
 * Hook for infinite scroll with intersection observer
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  isLoading: boolean
) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore()
        }
      },
      { rootMargin: '200px', threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, onLoadMore])

  return { sentinelRef: setSentinelRef }
}
