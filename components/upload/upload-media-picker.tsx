'use client'

import { useCallback, useMemo, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, Image as ImageIcon, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaPickerProps } from './types'

const MIME_EXTENSION_MAP: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov', '.qt'],
}

function buildDropzoneAccept(allowedTypes: string[]) {
  return allowedTypes.reduce<Record<string, string[]>>((acc, mimeType) => {
    acc[mimeType] = MIME_EXTENSION_MAP[mimeType] || []
    return acc
  }, {})
}

function formatAllowedTypes(allowedTypes: string[]) {
  if (allowedTypes.length === 0) return 'N/A'
  return allowedTypes
    .map((type) => type.replace('image/', '').replace('video/', '').toUpperCase())
    .join(', ')
}

function buildInputAccept(allowedTypes: string[]) {
  return allowedTypes.join(',')
}

export function UploadMediaPicker({
  onFilesSelected,
  currentCount,
  maxFiles,
  runtimeSettings,
}: MediaPickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const remainingSlots = maxFiles - currentCount
  const allowedTypesLabel = useMemo(
    () => formatAllowedTypes(runtimeSettings.allowedTypes),
    [runtimeSettings.allowedTypes]
  )
  const inputAccept = useMemo(
    () => buildInputAccept(runtimeSettings.allowedTypes),
    [runtimeSettings.allowedTypes]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: { file: File }[]) => {
      const allFiles = [...acceptedFiles, ...fileRejections.map((rejection) => rejection.file)]
      if (allFiles.length > 0) {
        onFilesSelected(allFiles)
      }
    },
    [onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: buildDropzoneAccept(runtimeSettings.allowedTypes),
    multiple: true,
    maxSize: runtimeSettings.maxFileSizeMB * 1024 * 1024,
    disabled: remainingSlots <= 0,
  })

  const handleCameraCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFilesSelected(Array.from(files))
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ''
      }
    },
    [onFilesSelected]
  )

  const isDisabled = remainingSlots <= 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Con lai: <span className="font-medium text-foreground">{remainingSlots}</span> slot
        </span>
        <span className="text-xs text-muted-foreground">
          Max {runtimeSettings.maxFileSizeMB}MB/file
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:hidden">
        <div>
          <input
            ref={cameraInputRef}
            type="file"
            accept={inputAccept}
            capture="environment"
            multiple
            onChange={handleCameraCapture}
            className="hidden"
            id="camera-capture"
            disabled={isDisabled}
          />
          <label
            htmlFor="camera-capture"
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-6 rounded-xl',
              'bg-gradient-to-br from-primary to-primary/80 text-white',
              'shadow-lg shadow-primary/25',
              'active:scale-[0.98] transition-transform',
              'cursor-pointer touch-target',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <span className="font-semibold">Chup anh</span>
          </label>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-6 rounded-xl',
            'bg-card border-2 border-dashed border-border',
            'hover:border-primary/50 hover:bg-accent/50',
            'active:scale-[0.98] transition-all',
            'cursor-pointer touch-target',
            isDragActive && 'border-primary bg-primary/5',
            isDisabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <span className="font-semibold text-foreground">Thu vien</span>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'hidden md:flex flex-col items-center justify-center gap-4 p-10 rounded-2xl',
          'bg-card border-2 border-dashed border-border',
          'hover:border-primary/50 hover:bg-accent/30',
          'transition-all duration-300 cursor-pointer',
          isDragActive && 'border-primary bg-primary/5 scale-[1.02]',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
            isDragActive
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Upload className="w-8 h-8" />
        </div>

        {isDragActive ? (
          <p className="text-lg font-bold text-primary">Tha file vao day!</p>
        ) : (
          <>
            <p className="text-lg font-semibold">Keo & tha file vao day</p>
            <p className="text-sm text-muted-foreground">
              hoac click de chon • toi da {maxFiles} file
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5" />
          {allowedTypesLabel}
        </span>
        <span>Nen ~{runtimeSettings.compressionTargetMB}MB @ {runtimeSettings.compressionQuality}%</span>
        {runtimeSettings.allowedTypes.some((type) => type.startsWith('video/')) && (
          <span className="flex items-center gap-1">
            <Video className="w-3.5 h-3.5" />
            Video enabled
          </span>
        )}
      </div>
    </div>
  )
}
