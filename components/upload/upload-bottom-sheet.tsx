'use client'

import { useState, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ChevronLeft, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUploadFlow } from './hooks/use-upload-flow'
import { UploadStepContent } from './upload-step-content'
import dynamic from 'next/dynamic'

// Dynamically import FilerobotEditor to reduce initial bundle size
const FilerobotEditor = dynamic(
  () => import('@/components/media/filerobot-image-editor').then((mod) => mod.FilerobotEditor),
  { ssr: false }
)
import type { UploadBottomSheetProps, FileWithPreview } from './types'

// Step titles for header
const STEP_TITLES: Record<string, string> = {
  event: 'Chọn Sự Kiện',
  media: 'Chọn Ảnh/Video',
  preview: 'Xem Trước',
  uploading: 'Đang Tải Lên',
  success: 'Hoàn Tất',
}

export function UploadBottomSheet({
  events,
  preSelectedEventId,
  trigger,
  onComplete,
  onClose,
  defaultOpen = false,
}: UploadBottomSheetProps) {
  const [open, setOpen] = useState(defaultOpen)

  // Find pre-selected event
  const preSelectedEvent = preSelectedEventId
    ? events.find((e) => e.id === preSelectedEventId)
    : undefined

  const flow = useUploadFlow({
    preSelectedEvent,
    onComplete: () => {
      onComplete?.()
      // Close sheet after success animation
      setTimeout(() => setOpen(false), 2000)
    },
  })

  // Image editor state
  const [editingFile, setEditingFile] = useState<{ file: FileWithPreview; index: number } | null>(null)

  // Handle sheet close
  const handleClose = useCallback(() => {
    if (flow.isUploading) return // Prevent closing during upload
    flow.reset()
    setOpen(false)
    onClose?.()
  }, [flow, onClose])

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (flow.step === 'event' || flow.step === 'uploading' || flow.step === 'success') {
      handleClose()
    } else {
      flow.goBack()
    }
  }, [flow, handleClose])

  // Handle file edit save
  const handleEditSave = useCallback(
    (croppedBlob: Blob) => {
      if (!editingFile) return

      const newFile = new File([croppedBlob], editingFile.file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      // Create new FileWithPreview
      const id = editingFile.file.id
      URL.revokeObjectURL(editingFile.file.preview)
      const newFileWithPreview = Object.assign(newFile, {
        preview: URL.createObjectURL(newFile),
        id,
      }) as FileWithPreview

      flow.updateFile(editingFile.file.id, newFileWithPreview)
      setEditingFile(null)
    },
    [editingFile, flow]
  )

  // Get current title
  const currentTitle = flow.selectedEvent
    ? `${STEP_TITLES[flow.step]} • ${flow.selectedEvent.title}`
    : STEP_TITLES[flow.step]

  // Show back button for non-initial steps
  const showBackButton = flow.step !== 'event' && flow.step !== 'uploading' && flow.step !== 'success'

  return (
    <>
      {/* Trigger */}
      {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}

      {/* Bottom Sheet */}
      <Sheet open={open} onOpenChange={(isOpen) => !flow.isUploading && setOpen(isOpen)}>
        <SheetContent
          side="bottom"
          className={cn(
            'h-[85vh] max-h-[85vh] flex flex-col p-0',
            'rounded-t-3xl',
            flow.step === 'uploading' && 'pointer-events-none'
          )}
        >
          {/* Header */}
          <SheetHeader className="flex-shrink-0 px-4 py-3 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2"
                    onClick={handleBack}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <SheetTitle className="text-lg font-semibold">{currentTitle}</SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClose}
                disabled={flow.isUploading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SheetDescription className="sr-only">
              Tải ảnh lên sự kiện
            </SheetDescription>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <UploadStepContent
              step={flow.step}
              events={events}
              files={flow.files}
              wishText={flow.wishText}
              error={flow.error}
              uploadProgress={flow.uploadProgress}
              fileProgress={flow.fileProgress}
              statusMessage={flow.statusMessage}
              isUploading={flow.isUploading}
              canUpload={flow.canUpload}
              onSelectEvent={flow.selectEvent}
              onAddFiles={flow.addFiles}
              onRemoveFile={flow.removeFile}
              onEditFile={(file, index) => setEditingFile({ file, index })}
              onClearFiles={flow.clearFiles}
              onSetWishText={flow.setWishText}
              onGoToStep={flow.goToStep}
              onStartUpload={flow.startUpload}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Image Editor - Filerobot with full features */}
      {editingFile && (
        <FilerobotEditor
          imageSrc={editingFile.file.preview}
          isOpen={!!editingFile}
          onClose={() => setEditingFile(null)}
          onSave={handleEditSave}
        />
      )}
    </>
  )
}
