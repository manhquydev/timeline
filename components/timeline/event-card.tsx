'use client'

import { useRef, useEffect } from 'react'
import { animate, type DOMKeyframesDefinition, type AnimationOptions } from 'motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { EventPhotoMosaic } from '../events/event-photo-mosaic'
import { Badge } from '@/components/ui/badge'
import { Calendar, Image as ImageIcon, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/hooks/use-motion'

interface EventCardProps {
  event: Event
  posts: Post[]
  index: number
  isVisible: boolean
  gradientClass: string
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-700 border-gray-300',
  open: 'bg-green-500/10 text-green-700 border-green-300',
  closed: 'bg-blue-500/10 text-blue-700 border-blue-300',
  archived: 'bg-gray-400/10 text-gray-600 border-gray-300',
}

const statusLabels: Record<string, string> = {
  draft: 'Nháp',
  open: 'Đang Mở',
  closed: 'Đã Đóng',
  archived: 'Lưu Trữ'
}

/**
 * EventCard - Timeline event card with Motion One animations
 * Features glass morphism, photo mosaic, and spring animations
 */
export function EventCard({ event, posts, index, isVisible, gradientClass }: EventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isEven = index % 2 === 0

  useEffect(() => {
    if (!cardRef.current || !isVisible) return

    // Respect reduced motion preference
    if (prefersReducedMotion()) {
      cardRef.current.style.opacity = '1'
      cardRef.current.style.transform = 'none'
      return
    }

    const initialRotate = isEven ? 'rotate(-3deg)' : 'rotate(3deg)'
    const keyframes: DOMKeyframesDefinition = {
      opacity: [0, 1],
      transform: [`translateY(40px) scale(0.95) ${initialRotate}`, 'translateY(0) scale(1) rotate(0deg)']
    }
    const options: AnimationOptions = {
      duration: 0.7,
      delay: index * 0.15,
      ease: [0.34, 1.56, 0.64, 1]
    }
    animate(cardRef.current, keyframes, options)
  }, [isVisible, index, isEven])

  return (
    <Link href={`/events/${event.slug}`}>
      <div
        ref={cardRef}
        className={cn(
          'group relative rounded-3xl border-2 shadow-2xl transition-all duration-300 overflow-hidden',
          'hover:-translate-y-2 hover:shadow-[0_20px_80px_rgba(0,0,0,0.15)]',
          'transform-gpu',
          !isVisible && 'opacity-0'
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.5)',
        }}
      >
        {/* Animated gradient border overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
            'pointer-events-none'
          )}
          style={{
            background: `linear-gradient(135deg, hsl(var(--gradient-${(index % 5) + 1}-start)) 0%, hsl(var(--gradient-${(index % 5) + 1}-mid)) 50%, hsl(var(--gradient-${(index % 5) + 1}-end)) 100%)`,
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Status badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge className={cn(
            'text-xs font-bold border px-3 py-1 shadow-lg',
            statusColors[event.status],
            'backdrop-blur-sm bg-white/80'
          )}>
            {statusLabels[event.status]}
          </Badge>
        </div>

        {/* Cover image or photo mosaic */}
        {event.cover_image_url ? (
          <div className="relative h-48 md:h-56 overflow-hidden">
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        ) : (
          <div className={cn(
            'relative h-48 md:h-56 flex items-center justify-center overflow-hidden',
            gradientClass
          )}>
            {posts && posts.length > 0 ? (
              <EventPhotoMosaic posts={posts} maxPhotos={6} />
            ) : (
              <>
                <div className="absolute inset-0 gradient-mesh opacity-40" />
                <ImageIcon className="w-16 h-16 text-white/80 drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className={cn(
            'heading-card text-xl md:text-2xl font-bold transition-all duration-300',
            'group-hover:text-primary'
          )}>
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Date */}
          <div className="flex items-center gap-3 text-sm">
            <div className={cn('p-2 rounded-lg shadow-md', gradientClass)}>
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-foreground">
              {formatDateRange(event.start_date, event.end_date)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 pt-4 border-t border-border/50">
            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl glass-subtle">
              <div className={cn('p-1.5 rounded-lg', gradientClass)}>
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{event.total_photos}</div>
                <div className="text-xs text-muted-foreground">ảnh</div>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl glass-subtle">
              <div className={cn('p-1.5 rounded-lg', gradientClass)}>
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{event.total_contributors}</div>
                <div className="text-xs text-muted-foreground">người</div>
              </div>
            </div>

            <div className="ml-auto group-hover:translate-x-1 transition-transform duration-300">
              <ChevronRight className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* 3D depth shadow */}
        <div
          className={cn(
            'absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10',
            gradientClass
          )}
        />
      </div>
    </Link>
  )
}
