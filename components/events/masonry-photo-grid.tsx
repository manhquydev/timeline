'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Post } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MasonryPhotoGridProps {
  posts: Post[]
  onPhotoClick?: (index: number) => void
  isLoading?: boolean
  className?: string
}

export function MasonryPhotoGrid({ posts, onPhotoClick, isLoading, className }: MasonryPhotoGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (postId: string) => {
    setLoadedImages((prev) => new Set(prev).add(postId))
  }

  if (isLoading) {
    return <MasonryPhotoGridSkeleton />
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chưa có ảnh nào.</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4',
        className
      )}
    >
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="group relative mb-3 md:mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-2xl bg-muted transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
          onClick={() => onPhotoClick?.(index)}
        >
          {/* Loading Skeleton */}
          {!loadedImages.has(post.id) && (
            <Skeleton className="absolute inset-0 z-10" />
          )}

          {/* Media */}
          {post.media_type === 'video' ? (
            <div className="relative aspect-video">
              <Image
                src={post.thumbnail_url || post.media_url}
                alt={post.wish_text || 'Video'}
                fill
                className="object-cover"
                onLoad={() => handleImageLoad(post.id)}
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="p-3 rounded-full bg-white/90 shadow-lg">
                  <Play className="h-6 w-6 text-primary fill-primary" />
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={post.thumbnail_url || post.media_url}
              alt={post.wish_text || 'Ảnh sự kiện'}
              width={post.dimensions?.width || 400}
              height={post.dimensions?.height || 300}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              onLoad={() => handleImageLoad(post.id)}
              loading="lazy"
              placeholder={post.blurhash ? 'blur' : 'empty'}
              blurDataURL={post.blurhash || undefined}
            />
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
              {post.wish_text && (
                <p className="text-white text-sm font-medium line-clamp-2 drop-shadow">
                  {post.wish_text}
                </p>
              )}
              {post.user_name && (
                <div className="flex items-center gap-1.5 text-white/80 text-xs">
                  <User className="h-3 w-3" />
                  <span>{post.user_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MasonryPhotoGridSkeleton() {
  const heights = [200, 280, 240, 320, 180, 260, 220, 300]

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
      {heights.map((height, i) => (
        <div
          key={i}
          className="mb-3 md:mb-4 break-inside-avoid rounded-2xl overflow-hidden"
          style={{ height }}
        >
          <Skeleton className="w-full h-full" />
        </div>
      ))}
    </div>
  )
}
