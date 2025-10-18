/**
 * Global Loading Page
 * Shown during page transitions
 */

import { EventCardSkeleton, StatsCardSkeleton } from '@/components/ui/loading-skeleton'

export default function Loading() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section Skeleton */}
      <div className="relative min-h-[85vh] flex items-center gradient-animated">
        <div className="relative container mx-auto px-4 py-20 z-10">
          <div className="text-center text-white max-w-5xl mx-auto">
            {/* Icon Skeleton */}
            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl glass-gradient animate-pulse">
              <div className="w-12 h-12 bg-white/30 rounded-full" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-4 mb-10">
              <div className="h-16 bg-white/20 rounded-2xl max-w-2xl mx-auto animate-pulse" />
              <div className="h-16 bg-white/15 rounded-2xl max-w-xl mx-auto animate-pulse" />
            </div>

            {/* Description Skeleton */}
            <div className="h-8 bg-white/10 rounded-xl max-w-3xl mx-auto mb-10 animate-pulse" />

            {/* Buttons Skeleton */}
            <div className="flex flex-wrap items-center justify-center gap-5 mb-16">
              <div className="h-14 w-52 bg-white/25 rounded-2xl animate-pulse" />
              <div className="h-14 w-52 bg-white/15 rounded-2xl animate-pulse" />
            </div>

            {/* Stats Skeleton */}
            <div className="flex flex-wrap justify-center gap-6">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 text-background">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 120L48 105C96 90 192 60 288 45C384 30 480 30 576 37.5C672 45 768 60 864 67.5C960 75 1056 75 1152 67.5C1248 60 1344 45 1392 37.5L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Timeline Navigation Skeleton */}
      <div className="bg-background -mt-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-32 bg-muted/50 rounded-xl animate-pulse shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid Skeleton */}
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-16">
          <div className="h-12 bg-muted/60 rounded-2xl max-w-md mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-muted/40 rounded-xl max-w-lg mx-auto animate-pulse" />
        </div>

        {/* Toggle Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="h-14 w-80 glass-gradient rounded-2xl animate-pulse" />
        </div>

        {/* Timeline Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  )
}
