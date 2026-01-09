/**
 * Loading Skeleton Components
 * Provides visual feedback during data loading
 */

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/80",
        className
      )}
      {...props}
    />
  )
}

// Event Card Skeleton
export function EventCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-border/50 shadow-lg animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40" />

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <Skeleton className="h-8 w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}

// Timeline Event Skeleton
export function TimelineEventSkeleton() {
  return (
    <div className="flex gap-6 md:gap-8 animate-pulse">
      {/* Date Badge */}
      <div className="flex flex-col items-center">
        <Skeleton className="h-16 w-16 rounded-2xl mb-2" />
        <div className="w-1 h-32 bg-muted/60 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 pb-12">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* Photo Grid Skeleton */}
        <div className="grid grid-cols-3 gap-2 pt-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Photo Grid Skeleton
export function PhotoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {[...Array(count)].map((_, i) => (
        <Skeleton
          key={i}
          className="aspect-square rounded-xl"
          style={{
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

// User Card Skeleton
export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 animate-pulse">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="glass-gradient rounded-2xl p-6 space-y-3 animate-pulse">
      <Skeleton className="h-12 w-24 mx-auto" />
      <Skeleton className="h-4 w-20 mx-auto" />
    </div>
  )
}

// Page Loader - Full Screen
export function PageLoader({ message = "Đang tải..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner !w-12 !h-12 !border-4" />
        <p className="text-fluid-base font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  )
}

// Inline Spinner
export function InlineSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "!w-4 !h-4 !border-2",
    md: "!w-6 !h-6 !border-2",
    lg: "!w-8 !h-8 !border-3",
  }

  return (
    <div className={cn("spinner", sizeClasses[size], className)} />
  )
}
