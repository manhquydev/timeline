/**
 * Upload Components - Barrel Export
 *
 * New modular upload system with bottom sheet flow (mobile-first)
 * Each component < 200 lines for maintainability
 */

// Main component
export { UploadBottomSheet } from './upload-bottom-sheet'
export { UploadStepContent } from './upload-step-content'

// Step components
export { UploadEventPicker } from './upload-event-picker'
export { UploadMediaPicker } from './upload-media-picker'
export { UploadMediaPreview } from './upload-media-preview'
export { UploadMessageInput } from './upload-message-input'
export { UploadProgressOverlay } from './upload-progress-overlay'

// Reusable UI components
export { UploadProgressRing } from './upload-progress-ring'
export { UploadSuccessAnimation } from './upload-success-animation'
export { UploadPreviewCard } from './upload-preview-card'

// Hooks
export { useUploadFlow } from './hooks/use-upload-flow'
export { useFileValidation } from './hooks/upload-file-validation'

// Reducer (for advanced usage)
export { uploadFlowReducer, initialUploadState, STEP_ORDER } from './hooks/upload-flow-reducer'

// Types
export type {
  UploadEvent,
  UploadRuntimeSettings,
  FileWithPreview,
  UploadStep,
  UploadFlowState,
  UploadError,
  UploadFlowAction,
  UploadBottomSheetProps,
  EventPickerProps,
  MediaPickerProps,
  MediaPreviewProps,
  MessageInputProps,
  ProgressOverlayProps,
} from './types'

// Utilities
export {
  createFileWithPreview,
  revokeFilePreview,
  revokeAllPreviews,
} from './types'

// Legacy component (deprecated - use UploadBottomSheet instead)
export { UploadZone } from './upload-zone'
