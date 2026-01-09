'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { Calendar, Image as ImageIcon, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BentoGridTimelineProps {
  events: { event: Event; posts: Post[] }[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-700',
  open: 'bg-green-500/10 text-green-700',
  closed: 'bg-blue-500/10 text-blue-700',
  archived: 'bg-gray-400/10 text-gray-600',
}

const statusLabels: Record<string, string> = {
  draft: 'Nháp',
  open: 'Đang Mở',
  closed: 'Đã Đóng',
  archived: 'Lưu Trữ'
}

/**
 * BentoGridTimeline - Pinterest/Masonry style grid layout
 * Features:
 * - Variable height cards based on content
 * - Hover effects with scale and glow
 * - Staggered reveal animation
 * - Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols
 */
export function BentoGridTimeline({ events }: BentoGridTimelineProps) {
  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
  )

  // Assign sizes for bento layout: large, medium, small
  const getSizeClass = (index: number) => {
    const pattern = index % 6
    if (pattern === 0) return 'md:col-span-2 md:row-span-2' // Large
    if (pattern === 3) return 'md:col-span-2' // Wide
    return '' // Normal
  }

  const getImageHeight = (index: number) => {
    const pattern = index % 6
    if (pattern === 0) return 'h-64 md:h-80'
    if (pattern === 3) return 'h-48'
    return 'h-40 md:h-48'
  }

  const gradientClasses = ['from-violet-500', 'from-rose-500', 'from-blue-500', 'from-amber-500', 'from-emerald-500']

  const getCoverImage = (event: Event, posts: Post[]) => {
    if (event.cover_image_url) return event.cover_image_url
    if (posts.length > 0) return posts[0].media_url
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {sortedEvents.map(({ event, posts }, index) => {
        const coverImage = getCoverImage(event, posts)
        const gradientClass = gradientClasses[index % gradientClasses.length]
        const sizeClass = getSizeClass(index)
        const imageHeight = getImageHeight(index)

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className={cn('group', sizeClass)}
          >
            <Link href={`/events/${event.slug}`}>
              <div className={cn(
                'relative rounded-2xl overflow-hidden',
                'bg-card border border-border/50',
                'shadow-lg hover:shadow-2xl',
                'transition-all duration-300',
                'hover:-translate-y-1 hover:scale-[1.02]',
                'transform-gpu'
              )}>
                {/* Cover Image */}
                <div className={cn('relative overflow-hidden', imageHeight)}>
                  {coverImage ? (
                    <>
                      <Image
                        src={coverImage}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-br to-black/50',
                      gradientClass
                    )}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white/60" />
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={cn(
                      'text-xs font-semibold backdrop-blur-sm',
                      statusColors[event.status]
                    )}>
                      {statusLabels[event.status]}
                    </Badge>
                  </div>

                  {/* Photo count overlay */}
                  {posts.length > 0 && (
                    <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {event.total_photos}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {formatDateRange(event.start_date, event.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs">{event.total_contributors}</span>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className={cn(
                  'absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10',
                  `bg-gradient-to-br ${gradientClass} to-transparent`
                )} />
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
