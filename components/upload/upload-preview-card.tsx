'use client'

import { X, Image as ImageIcon, Video, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadProgressRing } from './upload-progress-ring'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/upload-config'

interface UploadPreviewCardProps {
  file: File & { preview: string }
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  onRemove: () => void
  onRetry?: () => void
  disabled?: boolean
  className?: string
}

export function UploadPreviewCard({
  file,
  progress,
  status,
  onRemove,
  onRetry,
  disabled,
  className,
}: UploadPreviewCardProps) {
  const isVideo = file.type.startsWith('video/')
  const isUploading = status === 'uploading'
  const showOverlay = isUploading || status === 'success' || status === 'error'

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl',
        'bg-white/60 backdrop-blur-xl border border-white/30',
        'shadow-lg transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        status === 'success' && 'ring-2 ring-green-500/50',
        status === 'error' && 'ring-2 ring-red-500/50 animate-shake',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden">
        {isVideo ? (
          <video
            src={file.preview}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.preview}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Progress overlay */}
        {showOverlay && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <UploadProgressRing progress={progress} status={status} size="md" />
          </div>
        )}

        {/* File type badge */}
        <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm">
          {isVideo ? (
            <Video className="w-4 h-4 text-white" />
          ) : (
            <ImageIcon className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Remove button */}
        {!disabled && !isUploading && (
          <Button
            variant="destructive"
            size="icon"
            className={cn(
              'absolute top-2 right-2 w-7 h-7',
              'opacity-0 group-hover:opacity-100 transition-all duration-200',
              'bg-black/40 backdrop-blur-sm border-white/20 hover:bg-red-500'
            )}
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Retry button for failed uploads */}
        {status === 'error' && onRetry && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white text-red-600 font-medium gap-1.5"
            onClick={onRetry}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Thử lại
          </Button>
        )}
      </div>

      {/* File info */}
      <div className="p-2.5 bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-sm">
        <p className="text-xs font-medium text-white truncate">{file.name}</p>
        <p className="text-[10px] text-white/60 mt-0.5">{formatFileSize(file.size)}</p>
      </div>
    </div>
  )
}
