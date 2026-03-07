'use client'

import { useEffect, useMemo, useState } from 'react'
import { UPLOAD_LIMITS } from '@/lib/upload-config'
import type { UploadRuntimeSettings } from '../types'

const DEFAULT_UPLOAD_RUNTIME_SETTINGS: UploadRuntimeSettings = {
  maxFileSizeMB: UPLOAD_LIMITS.MAX_FILE_SIZE_MB,
  allowedTypes: [...UPLOAD_LIMITS.ALLOWED_TYPES],
  compressionQuality: 90,
  compressionTargetMB: UPLOAD_LIMITS.COMPRESSION_TARGET_MB,
  maxWidth: UPLOAD_LIMITS.MAX_WIDTH,
  maxHeight: UPLOAD_LIMITS.MAX_HEIGHT,
}

export function useUploadRuntimeSettings() {
  const [settings, setSettings] = useState<UploadRuntimeSettings>(DEFAULT_UPLOAD_RUNTIME_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/upload/settings', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          if (!isCancelled) {
            setIsLoaded(true)
          }
          return
        }

        const body = await response.json()
        if (!isCancelled) {
          setSettings({
            maxFileSizeMB:
              typeof body.maxFileSizeMB === 'number'
                ? body.maxFileSizeMB
                : DEFAULT_UPLOAD_RUNTIME_SETTINGS.maxFileSizeMB,
            allowedTypes:
              Array.isArray(body.allowedTypes) && body.allowedTypes.length > 0
                ? body.allowedTypes
                : DEFAULT_UPLOAD_RUNTIME_SETTINGS.allowedTypes,
            compressionQuality:
              typeof body.compressionQuality === 'number'
                ? body.compressionQuality
                : DEFAULT_UPLOAD_RUNTIME_SETTINGS.compressionQuality,
            compressionTargetMB:
              typeof body.compressionTargetMB === 'number'
                ? body.compressionTargetMB
                : DEFAULT_UPLOAD_RUNTIME_SETTINGS.compressionTargetMB,
            maxWidth:
              typeof body.maxWidth === 'number'
                ? body.maxWidth
                : DEFAULT_UPLOAD_RUNTIME_SETTINGS.maxWidth,
            maxHeight:
              typeof body.maxHeight === 'number'
                ? body.maxHeight
                : DEFAULT_UPLOAD_RUNTIME_SETTINGS.maxHeight,
          })
          setIsLoaded(true)
        }
      } catch {
        if (!isCancelled) {
          setIsLoaded(true)
        }
      }
    }

    loadSettings()

    return () => {
      isCancelled = true
    }
  }, [])

  const allowedTypeSet = useMemo(() => new Set(settings.allowedTypes), [settings.allowedTypes])

  return { settings, isLoaded, allowedTypeSet }
}
