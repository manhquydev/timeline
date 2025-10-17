import Image from 'next/image'
import Link from 'next/link'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { pluralize } from '@/lib/string-utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Image as ImageIcon, Users } from 'lucide-react'
import { EventPhotoMosaic } from './event-photo-mosaic'

interface EventCardProps {
  event: Event
  gradientIndex?: number
  posts?: Post[]
}

export function EventCard({ event, gradientIndex = 0, posts = [] }: EventCardProps) {
  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']
  const gradientClass = gradientClasses[gradientIndex % gradientClasses.length]

  const statusColors = {
    draft: 'bg-gray-500/90',
    open: 'bg-green-500/90',
    closed: 'bg-blue-500/90',
    archived: 'bg-gray-400/90',
  }

  const statusLabels = {
    draft: 'Nháp',
    open: 'Đang Mở',
    closed: 'Đã Đóng',
    archived: 'Lưu Trữ'
  }

  return (
    <Link href={`/events/${event.slug}`} className="block h-full group">
      <Card className="overflow-hidden cursor-pointer h-full hover-lift hover-tilt ripple sparkle glimmer shine-on-hover border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50">
        {/* Cover Image with Enhanced Gradient Overlay & Zoom Effect */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {event.cover_image_url ? (
            <>
              <Image
                src={event.cover_image_url}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Multi-layer gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              <div className={`absolute inset-0 ${gradientClass} opacity-0 group-hover:opacity-30 transition-all duration-500 mix-blend-overlay`} />
            </>
          ) : (
            <div className={`absolute inset-0 ${gradientClass} flex items-center justify-center relative overflow-hidden`}>
              {/* Show photo mosaic if posts available, otherwise show gradient mesh */}
              {posts && posts.length > 0 ? (
                <EventPhotoMosaic posts={posts} maxPhotos={9} />
              ) : (
                <>
                  <div className="absolute inset-0 gradient-mesh opacity-30" />
                  <ImageIcon className="h-16 w-16 text-white/90 drop-shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500" />
                </>
              )}
            </div>
          )}

          {/* Status Badge with enhanced glass effect */}
          <div className="absolute top-4 right-4 z-10">
            <Badge className={`${statusColors[event.status]} text-white capitalize glass-gradient shadow-xl font-bold px-3 py-1.5 text-xs backdrop-blur-xl border border-white/30`}>
              {statusLabels[event.status]}
            </Badge>
          </div>

          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Title with enhanced fluid typography and gradient on hover */}
          <h3 className="font-black text-fluid-lg mb-2 line-clamp-2 transition-all duration-300 group-hover:text-primary leading-tight">
            {event.title}
          </h3>

          {/* Description with better typography */}
          {event.description && (
            <p className="text-fluid-sm text-muted-foreground/90 mb-3 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Date with enhanced gradient icon and glass background */}
          <div className="flex items-center gap-3 text-fluid-sm text-foreground/80 mb-3 p-2.5 rounded-xl glass-gradient group-hover:glass transition-all">
            <div className={`p-2 rounded-lg ${gradientClass} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Calendar className="h-4 w-4 text-white drop-shadow" />
            </div>
            <span className="font-semibold">{formatDateRange(event.start_date, event.end_date)}</span>
          </div>

          {/* Enhanced Stats with gradient backgrounds */}
          <div className="flex items-center gap-3 text-fluid-sm">
            <div className="flex-1 p-3 rounded-xl glass-gradient hover:glass transition-all group-hover:shadow-lg">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${gradientClass} shadow-md`}>
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-black text-lg text-foreground">{event.total_photos}</div>
                  <div className="text-xs text-muted-foreground font-medium">ảnh</div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-3 rounded-xl glass-gradient hover:glass transition-all group-hover:shadow-lg">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${gradientClass} shadow-md`}>
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-black text-lg text-foreground">{event.total_contributors}</div>
                  <div className="text-xs text-muted-foreground font-medium">người</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
