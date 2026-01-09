'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { Calendar, Image as ImageIcon, Users, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDateRange } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

interface EventHeroCoverProps {
  event: {
    title: string
    description?: string | null
    status: 'draft' | 'open' | 'closed' | 'archived'
    start_date: Date | string
    end_date?: Date | string | null
    cover_image_url?: string | null
    stats?: {
      total_photos: number
      total_contributors: number
    }
    branding?: {
      primary_color?: string | null
      logo_url?: string | null
    }
  }
  className?: string
}

const statusConfig = {
  draft: { label: 'Nháp', class: 'bg-gray-500/90' },
  open: { label: 'Đang mở', class: 'bg-green-500/90' },
  closed: { label: 'Đã đóng', class: 'bg-blue-500/90' },
  archived: { label: 'Lưu trữ', class: 'bg-gray-400/90' },
}

export function EventHeroCover({ event, className }: EventHeroCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToContent = () => {
    const heroHeight = containerRef.current?.offsetHeight || 0
    window.scrollTo({ top: heroHeight - 80, behavior: 'smooth' })
  }

  const parallaxOffset = scrollY * 0.4
  const opacity = Math.max(0, 1 - scrollY / 400)

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-[60vh] md:h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden',
        className
      )}
    >
      {/* Cover Image with Parallax */}
      {event.cover_image_url ? (
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content Overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-6 md:p-10"
        style={{ opacity }}
      >
        <div className="container mx-auto max-w-6xl space-y-4">
          {/* Logo */}
          {event.branding?.logo_url && (
            <Image
              src={event.branding.logo_url}
              alt="Logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          )}

          {/* Title & Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              {event.title}
            </h1>
            <Badge className={cn('text-white', statusConfig[event.status].class)}>
              {statusConfig[event.status].label}
            </Badge>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-white/90 text-lg max-w-2xl line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Glass Info Bar */}
          <div className="inline-flex items-center gap-4 md:gap-6 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center gap-2 text-white/90">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatDateRange(event.start_date, event.end_date)}
              </span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2 text-white/90">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{event.stats?.total_photos || 0} ảnh</span>
            </div>
            <div className="w-px h-4 bg-white/30 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-white/90">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{event.stats?.total_contributors || 0} người</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 hover:bg-white/20 transition-colors animate-bounce"
        aria-label="Cuộn xuống"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  )
}
