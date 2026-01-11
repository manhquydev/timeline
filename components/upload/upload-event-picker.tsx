'use client'

import { Calendar, Image as ImageIcon, Video, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventPickerProps, UploadEvent } from './types'

export function UploadEventPicker({ events, onSelect }: EventPickerProps) {
  // Filter to only show events that allow uploads
  const uploadableEvents = events.filter((e) => e.status === 'open' && e.allow_upload)

  if (uploadableEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có sự kiện nào</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Hiện tại không có sự kiện nào đang nhận ảnh. Vui lòng quay lại sau.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Chọn sự kiện bạn muốn tải ảnh lên
      </p>

      <div className="space-y-2">
        {uploadableEvents.map((event) => (
          <EventCard key={event.id} event={event} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

interface EventCardProps {
  event: UploadEvent
  onSelect: (event: UploadEvent) => void
}

function EventCard({ event, onSelect }: EventCardProps) {
  const totalMedia = event.total_photos + event.total_videos

  return (
    <button
      onClick={() => onSelect(event)}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl',
        'bg-card border border-border/50',
        'hover:bg-accent hover:border-primary/30',
        'active:scale-[0.98]',
        'transition-all duration-200',
        'text-left touch-target'
      )}
    >
      {/* Cover image or placeholder */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
        {event.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <ImageIcon className="w-6 h-6 text-primary/50" />
          </div>
        )}
      </div>

      {/* Event info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base truncate">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {event.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            {event.total_photos}
          </span>
          {event.total_videos > 0 && (
            <span className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              {event.total_videos}
            </span>
          )}
          <span className="text-green-600 font-medium">Đang mở</span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="flex-shrink-0 w-5 h-5 text-muted-foreground" />
    </button>
  )
}
