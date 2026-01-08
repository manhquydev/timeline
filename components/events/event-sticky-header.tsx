'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Image as ImageIcon, Users, Upload, ChevronLeft } from 'lucide-react'
import { formatDateRange } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EventStickyHeaderProps {
  event: {
    id: string
    title: string
    slug: string
    status: 'draft' | 'open' | 'closed' | 'archived'
    start_date: Date | string
    end_date?: Date | string | null
    stats?: {
      total_photos: number
      total_contributors: number
    }
  }
  canUpload?: boolean
  onUploadClick?: () => void
}

export function EventStickyHeader({ event, canUpload, onUploadClick }: EventStickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling past 200px
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const statusColors = {
    draft: 'bg-gray-500/90',
    open: 'bg-green-500/90',
    closed: 'bg-blue-500/90',
    archived: 'bg-gray-400/90',
  }

  const statusLabels = {
    draft: 'Nháp',
    open: 'Mở',
    closed: 'Đóng',
    archived: 'Lưu trữ'
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 transform',
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="glass border-b shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link href="/" className="shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>

              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-sm md:text-base truncate">
                  {event.title}
                </h1>
              </div>

              <Badge
                className={cn(
                  'shrink-0 text-white text-xs px-2 py-0.5',
                  statusColors[event.status]
                )}
              >
                {statusLabels[event.status]}
              </Badge>
            </div>

            {/* Center: Quick stats (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDateRange(event.start_date, event.end_date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" />
                <span>{event.stats?.total_photos || 0} ảnh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{event.stats?.total_contributors || 0} người</span>
              </div>
            </div>

            {/* Right: Upload button */}
            {canUpload && (
              <Button
                size="sm"
                className="shrink-0 gradient-1 text-white"
                onClick={onUploadClick}
              >
                <Upload className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Tải Ảnh</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
