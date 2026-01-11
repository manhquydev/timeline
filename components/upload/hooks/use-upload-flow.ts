'use client'

import { useReducer, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useLoadingStore } from '@/lib/stores/loading-store'
import { smartUpload } from '@/lib/supabase/direct-upload'
import {
  PROGRESS_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '@/lib/upload-config'
import {
  UploadEvent,
  FileWithPreview,
  UploadStep,
  revokeAllPreviews,
} from '../types'
import { uploadFlowReducer, initialUploadState } from './upload-flow-reducer'
import { useFileValidation } from './upload-file-validation'

interface UseUploadFlowOptions {
  preSelectedEvent?: UploadEvent
  onComplete?: () => void
}

export function useUploadFlow(options: UseUploadFlowOptions = {}) {
  const { preSelectedEvent, onComplete } = options
  const router = useRouter()
  const { toast } = useToast()
  const { setUploading: setGlobalUploading } = useLoadingStore()

  // Initialize with pre-selected event if provided
  const getInitialState = () => {
    if (preSelectedEvent) {
      return { ...initialUploadState, selectedEvent: preSelectedEvent, step: 'media' as const }
    }
    return initialUploadState
  }

  const [state, dispatch] = useReducer(uploadFlowReducer, undefined, getInitialState)

  // File validation with extracted hook
  const { addFiles } = useFileValidation(state.files, {
    onError: (error) => dispatch({ type: 'UPLOAD_ERROR', error }),
    onAddFiles: (files) => dispatch({ type: 'ADD_FILES', files }),
  })

  // Remove a file
  const removeFile = useCallback((fileId: string) => {
    const file = state.files.find((f) => f.id === fileId)
    if (file) {
      URL.revokeObjectURL(file.preview)
    }
    dispatch({ type: 'REMOVE_FILE', fileId })
  }, [state.files])

  // Update a file (after editing)
  const updateFile = useCallback((fileId: string, newFile: FileWithPreview) => {
    dispatch({ type: 'UPDATE_FILE', fileId, file: newFile })
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    revokeAllPreviews(state.files)
    dispatch({ type: 'CLEAR_FILES' })
  }, [state.files])

  // Select event
  const selectEvent = useCallback((event: UploadEvent) => {
    dispatch({ type: 'SELECT_EVENT', event })
  }, [])

  // Set wish text
  const setWishText = useCallback((text: string) => {
    dispatch({ type: 'SET_WISH_TEXT', text })
  }, [])

  // Navigate to step
  const goToStep = useCallback((step: UploadStep) => {
    dispatch({ type: 'SET_STEP', step })
  }, [])

  // Go back
  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' })
  }, [])

  // Reset flow
  const reset = useCallback(() => {
    revokeAllPreviews(state.files)
    dispatch({ type: 'RESET' })
  }, [state.files])

  // Start upload
  const startUpload = useCallback(async () => {
    if (!state.selectedEvent || state.files.length === 0) return

    dispatch({ type: 'START_UPLOAD' })
    setGlobalUploading(true, 0)

    try {
      const result = await smartUpload({
        eventId: state.selectedEvent.id,
        files: state.files,
        wishText: state.wishText,
        onProgress: (progress) => {
          const totalProgress = progress.reduce((sum, p) => sum + p.progress, 0) / progress.length
          dispatch({ type: 'UPDATE_PROGRESS', progress: Math.round(totalProgress), fileProgress: progress })
          setGlobalUploading(true, Math.round(totalProgress))
        },
      })

      if (result.successCount === state.files.length) {
        dispatch({ type: 'UPLOAD_SUCCESS' })
        const successMsg = SUCCESS_MESSAGES.UPLOAD_COMPLETE(result.successCount)
        toast({ title: successMsg.title, description: successMsg.message, duration: 3000 })
        revokeAllPreviews(state.files)
        onComplete?.()
        setTimeout(() => router.refresh(), 1500)
      } else if (result.successCount > 0) {
        const error = ERROR_MESSAGES.PARTIAL_SUCCESS(
          result.successCount,
          state.files.length,
          state.fileProgress.filter((p) => p.status === 'failed').map((p) => p.fileName)
        )
        dispatch({ type: 'UPLOAD_ERROR', error })
        toast({ title: error.title, description: error.message, variant: 'destructive' })
      } else {
        throw new Error('Tất cả ảnh tải lên thất bại')
      }
    } catch (err: any) {
      const error = err.message?.includes('network')
        ? ERROR_MESSAGES.NETWORK_ERROR
        : { title: '❌ Lỗi tải lên', message: err.message || 'Vui lòng thử lại' }
      dispatch({ type: 'UPLOAD_ERROR', error })
      toast({ title: error.title, description: error.message, variant: 'destructive' })
    } finally {
      setGlobalUploading(false, 0)
    }
  }, [state.selectedEvent, state.files, state.wishText, state.fileProgress, toast, router, onComplete, setGlobalUploading])

  // Computed values
  const canProceedToPreview = state.files.length > 0
  const canUpload = !!state.selectedEvent && state.files.length > 0 && !state.isUploading

  // Current status message
  const statusMessage = useMemo(() => {
    if (!state.isUploading) return ''
    const completed = state.fileProgress.filter((p) => p.status === 'completed').length
    const uploading = state.fileProgress.find((p) => p.status === 'uploading')
    if (uploading) return PROGRESS_MESSAGES.UPLOADING(completed + 1, state.files.length)
    const compressing = state.fileProgress.find((p) => p.status === 'compressing')
    if (compressing) return PROGRESS_MESSAGES.COMPRESSING(completed + 1, state.files.length)
    return PROGRESS_MESSAGES.VALIDATING
  }, [state.isUploading, state.fileProgress, state.files.length])

  return {
    ...state,
    statusMessage,
    canProceedToPreview,
    canUpload,
    selectEvent,
    addFiles,
    removeFile,
    updateFile,
    clearFiles,
    setWishText,
    goToStep,
    goBack,
    startUpload,
    reset,
  }
}
