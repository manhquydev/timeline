/**
 * Upload File Validation Hook
 * Handles file validation and processing for upload flow
 */

import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  validateFileCount,
  validateFile,
  validateTotalSize,
  UPLOAD_LIMITS,
} from '@/lib/upload-config'
import {
  FileWithPreview,
  UploadError,
  createFileWithPreview,
  revokeAllPreviews,
} from '../types'
import type { UploadRuntimeSettings } from '../types'

interface UseFileValidationOptions {
  onError: (error: UploadError) => void
  onAddFiles: (files: FileWithPreview[]) => void
  runtimeSettings: UploadRuntimeSettings
}

export function useFileValidation(
  currentFiles: FileWithPreview[],
  options: UseFileValidationOptions
) {
  const { toast } = useToast()
  const { onError, onAddFiles, runtimeSettings } = options

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const currentCount = currentFiles.length

      const validFiles: FileWithPreview[] = []
      const errors: string[] = []

      // Validate each file
      newFiles.forEach((file) => {
        const validation = validateFile(file, {
          allowedTypes: runtimeSettings.allowedTypes,
          maxFileSizeMB: runtimeSettings.maxFileSizeMB,
        })
        if (validation.valid) {
          validFiles.push(createFileWithPreview(file))
        } else if (validation.error) {
          errors.push(`${file.name}: ${validation.error.message}`)
        }
      })

      const newTotalCount = currentCount + validFiles.length

      // Validate count after filtering invalid files
      const countValidation = validateFileCount(newTotalCount)
      if (!countValidation.valid && countValidation.error) {
        const error = typeof countValidation.error === 'function'
          ? countValidation.error(newTotalCount)
          : countValidation.error
        onError(error)
        toast({ title: error.title, description: error.message, variant: 'destructive' })
        revokeAllPreviews(validFiles)
        return false
      }

      if (errors.length > 0) {
        toast({
          title: '⚠️ Một số file không hợp lệ',
          description: errors.slice(0, 2).join('\n'),
          variant: 'destructive',
        })
      }

      if (validFiles.length > 0) {
        // Validate total size
        const allFiles = [...currentFiles, ...validFiles]
        const sizeValidation = validateTotalSize(allFiles, UPLOAD_LIMITS.MAX_TOTAL_SIZE_MB)
        if (!sizeValidation.valid && sizeValidation.error) {
          onError(sizeValidation.error)
          toast({
            title: sizeValidation.error.title,
            description: sizeValidation.error.message,
            variant: 'destructive',
          })
          revokeAllPreviews(validFiles)
          return false
        }

        onAddFiles(validFiles)
        return true
      }

      return false
    },
    [currentFiles, toast, onError, onAddFiles, runtimeSettings]
  )

  return { addFiles }
}
