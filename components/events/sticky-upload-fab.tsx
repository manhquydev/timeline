'use client'

import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadBottomSheet } from '@/components/upload/upload-bottom-sheet'
import type { UploadEvent } from '@/components/upload/types'
import { cn } from '@/lib/utils'

interface StickyUploadFabProps {
  eventId: string
  eventTitle: string
  className?: string
}

export function StickyUploadFab({ eventId, eventTitle, className }: StickyUploadFabProps) {
  // Create single event for bottom sheet
  const event: UploadEvent = {
    id: eventId,
    title: eventTitle,
    slug: '', // Not needed when pre-selected
    total_photos: 0,
    total_videos: 0,
    status: 'open',
    allow_upload: true,
  }

  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6',
        className
      )}
    >
      <UploadBottomSheet
        events={[event]}
        preSelectedEventId={eventId}
        trigger={
          <Button
            size="lg"
            className={cn(
              'h-14 w-14 md:h-auto md:w-auto md:px-6 rounded-full shadow-lg',
              'bg-gradient-to-r from-primary to-primary/80',
              'hover:shadow-xl hover:scale-105 transition-all duration-200',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
            )}
          >
            <Upload className="h-6 w-6 md:mr-2" />
            <span className="hidden md:inline font-medium">Tải Ảnh Lên</span>
          </Button>
        }
      />
    </div>
  )
}
