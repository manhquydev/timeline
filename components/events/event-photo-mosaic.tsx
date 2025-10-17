'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import type { Post } from '@/lib/types'

interface EventPhotoMosaicProps {
  posts: Post[]
  maxPhotos?: number
  className?: string
}

export function EventPhotoMosaic({ posts, maxPhotos = 9, className = '' }: EventPhotoMosaicProps) {
  const [mounted, setMounted] = useState(false)
  const [animationIndex, setAnimationIndex] = useState(0)

  // Filter approved posts with images
  const approvedPosts = useMemo(() => {
    return posts
      .filter((post) => post.status === 'approved' && post.media_type === 'image')
      .slice(0, maxPhotos)
  }, [posts, maxPhotos])

  useEffect(() => {
    setMounted(true)

    // Cycle through photos for animation effect
    const interval = setInterval(() => {
      setAnimationIndex((prev) => (prev + 1) % Math.max(approvedPosts.length, 1))
    }, 3000)

    return () => clearInterval(interval)
  }, [approvedPosts.length])

  if (!mounted || approvedPosts.length === 0) {
    return null
  }

  // Create mosaic layout patterns based on number of photos
  const getMosaicLayout = () => {
    const count = Math.min(approvedPosts.length, maxPhotos)

    // Different layouts based on photo count
    if (count === 1) {
      return ['col-span-2 row-span-2']
    } else if (count === 2) {
      return ['col-span-1 row-span-2', 'col-span-1 row-span-2']
    } else if (count === 3) {
      return ['col-span-1 row-span-2', 'col-span-1 row-span-1', 'col-span-1 row-span-1']
    } else if (count === 4) {
      return ['col-span-1 row-span-1', 'col-span-1 row-span-1', 'col-span-1 row-span-1', 'col-span-1 row-span-1']
    } else if (count >= 5) {
      return [
        'col-span-1 row-span-2', // Large left
        'col-span-1 row-span-1', // Top right
        'col-span-1 row-span-1', // Middle right
        'col-span-1 row-span-1', // Bottom left
        'col-span-1 row-span-1', // Bottom right
        ...(count > 5 ? ['col-span-1 row-span-1'] : []),
        ...(count > 6 ? ['col-span-1 row-span-1'] : []),
        ...(count > 7 ? ['col-span-1 row-span-1'] : []),
        ...(count > 8 ? ['col-span-1 row-span-1'] : []),
      ].slice(0, count)
    }

    return []
  }

  const layouts = getMosaicLayout()

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10" />

      {/* Mosaic Grid */}
      <div className="relative w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-1">
        {approvedPosts.map((post, index) => {
          const layout = layouts[index] || 'col-span-1 row-span-1'
          const isActive = index === animationIndex
          const delay = index * 150

          return (
            <div
              key={post.id}
              className={`relative ${layout} overflow-hidden rounded-sm group transition-all duration-500`}
              style={{
                animationDelay: `${delay}ms`,
              }}
            >
              {/* Photo */}
              <div className={`relative w-full h-full transition-all duration-700 ${
                isActive ? 'scale-110 brightness-110' : 'scale-100 brightness-90'
              }`}>
                {post.blurhash && (
                  <div
                    className="absolute inset-0 z-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23${post.blurhash?.slice(0, 6) || 'cccccc'}' filter='url(%23b)'/%3E%3C/svg%3E")`,
                      backgroundSize: 'cover',
                      filter: 'blur(20px)',
                    }}
                  />
                )}
                <Image
                  src={post.thumbnail_url || post.media_url}
                  alt={post.wish_text || 'Event photo'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>

              {/* Shimmer effect on hover */}
              <div className={`absolute inset-0 z-20 opacity-0 transition-opacity duration-500 ${
                isActive ? 'opacity-100' : ''
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"
                  style={{
                    animation: isActive ? 'shimmer 2s ease-in-out' : 'none'
                  }}
                />
              </div>

              {/* Subtle border glow */}
              <div className={`absolute inset-0 z-10 border transition-all duration-500 rounded-sm ${
                isActive
                  ? 'border-white/40 shadow-lg shadow-white/20'
                  : 'border-white/10'
              }`} />
            </div>
          )
        })}
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Photo count indicator */}
      {approvedPosts.length > maxPhotos && (
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold border border-white/20">
          +{posts.length - maxPhotos} ảnh
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10%, 90% {
            opacity: 0.5;
          }
          50% {
            transform: translate(20px, -30px) scale(1.5);
            opacity: 0.8;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .animate-float-particle {
          animation: float-particle 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
