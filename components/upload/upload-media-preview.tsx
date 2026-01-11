'use client'

import { Plus, X, Edit2, Image as ImageIcon, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatFileSize, UPLOAD_LIMITS } from '@/lib/upload-config'
import type { MediaPreviewProps, FileWithPreview } from './types'

export function UploadMediaPreview({
  files,
  onRemove,
  onEdit,
  onAddMore,
  disabled = false,
}: MediaPreviewProps) {
  const canAddMore = files.length < UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {files.length} ảnh đã chọn
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => files.forEach((f) => onRemove(f.id))}
          disabled={disabled}
          className="text-muted-foreground hover:text-destructive"
        >
          Xóa tất cả
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {files.map((file, index) => (
          <PreviewCard
            key={file.id}
            file={file}
            index={index}
            onRemove={() => onRemove(file.id)}
            onEdit={() => onEdit(file, index)}
            disabled={disabled}
          />
        ))}

        {/* Add more button */}
        {canAddMore && !disabled && (
          <button
            onClick={onAddMore}
            className={cn(
              'aspect-square rounded-xl',
              'border-2 border-dashed border-border',
              'flex flex-col items-center justify-center gap-1',
              'hover:border-primary/50 hover:bg-accent/50',
              'active:scale-[0.98] transition-all',
              'text-muted-foreground'
            )}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-medium">Thêm</span>
          </button>
        )}
      </div>

      {/* Total size info */}
      <div className="text-xs text-muted-foreground text-center">
        Tổng dung lượng: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
      </div>
    </div>
  )
}

interface PreviewCardProps {
  file: FileWithPreview
  index: number
  onRemove: () => void
  onEdit: () => void
  disabled: boolean
}

function PreviewCard({ file, index, onRemove, onEdit, disabled }: PreviewCardProps) {
  const isVideo = file.type.startsWith('video/')

  return (
    <div
      className={cn(
        'group relative aspect-square rounded-xl overflow-hidden',
        'bg-muted shadow-sm',
        'animate-scale-in'
      )}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Thumbnail */}
      {isVideo ? (
        <video
          src={file.preview}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={file.preview}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      )}

      {/* Type badge */}
      <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/50 backdrop-blur-sm">
        {isVideo ? (
          <Video className="w-3 h-3 text-white" />
        ) : (
          <ImageIcon className="w-3 h-3 text-white" />
        )}
      </div>

      {/* Hover overlay with actions */}
      {!disabled && (
        <div
          className={cn(
            'absolute inset-0 bg-black/40 backdrop-blur-[2px]',
            'flex items-center justify-center gap-2',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          {/* Edit button (images only) */}
          {!isVideo && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={onEdit}
            >
              <Edit2 className="w-4 h-4 text-primary" />
            </Button>
          )}

          {/* Remove button */}
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* File size */}
      <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-[10px] text-white/80 truncate">{formatFileSize(file.size)}</p>
      </div>
    </div>
  )
}
