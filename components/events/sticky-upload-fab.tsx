'use client'

import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UploadZone } from '@/components/upload/upload-zone'
import { cn } from '@/lib/utils'

interface StickyUploadFabProps {
  eventId: string
  eventTitle: string
  className?: string
}

export function StickyUploadFab({ eventId, eventTitle, className }: StickyUploadFabProps) {
  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6',
        className
      )}
    >
      <Dialog>
        <DialogTrigger asChild>
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
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tải Ảnh Lên {eventTitle}</DialogTitle>
            <DialogDescription>
              Chia sẻ kỷ niệm của bạn từ sự kiện này
            </DialogDescription>
          </DialogHeader>
          <UploadZone eventId={eventId} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
