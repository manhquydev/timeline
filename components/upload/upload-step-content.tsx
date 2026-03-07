'use client'

import { Button } from '@/components/ui/button'
import { UPLOAD_LIMITS } from '@/lib/upload-config'
import { UploadEventPicker } from './upload-event-picker'
import { UploadMediaPicker } from './upload-media-picker'
import { UploadMediaPreview } from './upload-media-preview'
import { UploadMessageInput } from './upload-message-input'
import { UploadProgressOverlay } from './upload-progress-overlay'
import type { UploadEvent, FileWithPreview, UploadStep, UploadError, UploadRuntimeSettings } from './types'
import type { DirectUploadProgress } from '@/lib/supabase/direct-upload'

interface UploadStepContentProps {
  step: UploadStep
  events: UploadEvent[]
  files: FileWithPreview[]
  wishText: string
  error: UploadError | null
  uploadProgress: number
  fileProgress: DirectUploadProgress[]
  statusMessage: string
  isUploading: boolean
  canUpload: boolean
  runtimeSettings: UploadRuntimeSettings
  onSelectEvent: (event: UploadEvent) => void
  onAddFiles: (files: File[]) => void
  onRemoveFile: (fileId: string) => void
  onEditFile: (file: FileWithPreview, index: number) => void
  onClearFiles: () => void
  onSetWishText: (text: string) => void
  onGoToStep: (step: UploadStep) => void
  onStartUpload: () => void
}

export function UploadStepContent({
  step,
  events,
  files,
  wishText,
  error,
  uploadProgress,
  fileProgress,
  statusMessage,
  isUploading,
  canUpload,
  runtimeSettings,
  onSelectEvent,
  onAddFiles,
  onRemoveFile,
  onEditFile,
  onClearFiles,
  onSetWishText,
  onGoToStep,
  onStartUpload,
}: UploadStepContentProps) {
  // Step 1: Event Selection
  if (step === 'event') {
    return <UploadEventPicker events={events} onSelect={onSelectEvent} />
  }

  // Step 2: Media Selection
  if (step === 'media') {
    return (
      <div className="p-4 space-y-4">
        <UploadMediaPicker
          onFilesSelected={onAddFiles}
          currentCount={files.length}
          maxFiles={UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD}
          runtimeSettings={runtimeSettings}
        />

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {files.length} ảnh đã chọn
              </span>
              <Button variant="link" size="sm" onClick={onClearFiles}>
                Xóa tất cả
              </Button>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => onGoToStep('preview')}
            >
              Tiếp tục
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Step 3: Preview + Message
  if (step === 'preview') {
    return (
      <div className="p-4 space-y-6">
        <UploadMediaPreview
          files={files}
          onRemove={onRemoveFile}
          onEdit={onEditFile}
          onAddMore={() => onGoToStep('media')}
          disabled={isUploading}
        />

        <UploadMessageInput
          value={wishText}
          onChange={onSetWishText}
          maxLength={500}
          disabled={isUploading}
        />

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm font-medium text-destructive">{error.title}</p>
            <p className="text-xs text-destructive/80 mt-1">{error.message}</p>
          </div>
        )}

        <Button
          className="w-full py-6 text-base font-semibold"
          size="lg"
          onClick={onStartUpload}
          disabled={!canUpload}
        >
          Tải Lên {files.length} Ảnh
        </Button>
      </div>
    )
  }

  // Step 4: Uploading / Success
  if (step === 'uploading' || step === 'success') {
    return (
      <UploadProgressOverlay
        show={true}
        progress={uploadProgress}
        status={statusMessage}
        fileProgress={fileProgress}
        totalFiles={files.length}
      />
    )
  }

  return null
}
