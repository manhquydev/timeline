/**
 * Upload Flow Types
 * Shared types for the bottom sheet upload components
 */

import type { DirectUploadProgress } from '@/lib/supabase/direct-upload'

// Event data passed to upload components
export interface UploadEvent {
  id: string
  title: string
  slug: string
  description?: string | null
  cover_image_url?: string | null
  total_photos: number
  total_videos: number
  status: 'open' | 'closed' | 'draft'
  allow_upload: boolean
}

// File with preview URL and unique ID for React keys
export interface FileWithPreview extends File {
  preview: string
  id: string
}

// Upload flow steps
export type UploadStep = 'event' | 'media' | 'preview' | 'uploading' | 'success'

// Main state for upload flow
export interface UploadFlowState {
  step: UploadStep
  selectedEvent: UploadEvent | null
  files: FileWithPreview[]
  wishText: string
  uploadProgress: number
  fileProgress: DirectUploadProgress[]
  error: UploadError | null
  isUploading: boolean
}

// Error structure matching upload-config.ts
export interface UploadError {
  title: string
  message: string
  action?: string
}

// Actions for upload flow reducer
export type UploadFlowAction =
  | { type: 'SELECT_EVENT'; event: UploadEvent }
  | { type: 'ADD_FILES'; files: FileWithPreview[] }
  | { type: 'REMOVE_FILE'; fileId: string }
  | { type: 'UPDATE_FILE'; fileId: string; file: FileWithPreview }
  | { type: 'CLEAR_FILES' }
  | { type: 'SET_WISH_TEXT'; text: string }
  | { type: 'SET_STEP'; step: UploadStep }
  | { type: 'START_UPLOAD' }
  | { type: 'UPDATE_PROGRESS'; progress: number; fileProgress: DirectUploadProgress[] }
  | { type: 'UPLOAD_SUCCESS' }
  | { type: 'UPLOAD_ERROR'; error: UploadError }
  | { type: 'RESET' }
  | { type: 'GO_BACK' }

// Props for bottom sheet trigger
export interface UploadBottomSheetProps {
  events: UploadEvent[]
  preSelectedEventId?: string
  trigger?: React.ReactNode
  onComplete?: () => void
  onClose?: () => void
  defaultOpen?: boolean
}

// Props for event picker
export interface EventPickerProps {
  events: UploadEvent[]
  onSelect: (event: UploadEvent) => void
}

// Props for media picker
export interface MediaPickerProps {
  onFilesSelected: (files: File[]) => void
  currentCount: number
  maxFiles: number
}

// Props for media preview
export interface MediaPreviewProps {
  files: FileWithPreview[]
  onRemove: (fileId: string) => void
  onEdit: (file: FileWithPreview, index: number) => void
  onAddMore: () => void
  disabled?: boolean
}

// Props for message input
export interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  disabled?: boolean
}

// Props for progress overlay
export interface ProgressOverlayProps {
  show: boolean
  progress: number
  status: string
  fileProgress: DirectUploadProgress[]
  totalFiles: number
  onSuccess?: () => void
}

// Helper to create FileWithPreview from File
export function createFileWithPreview(file: File): FileWithPreview {
  const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  return Object.assign(file, {
    preview: URL.createObjectURL(file),
    id,
  })
}

// Helper to revoke preview URLs
export function revokeFilePreview(file: FileWithPreview): void {
  URL.revokeObjectURL(file.preview)
}

// Helper to revoke all preview URLs
export function revokeAllPreviews(files: FileWithPreview[]): void {
  files.forEach(revokeFilePreview)
}
