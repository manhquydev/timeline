import { connectToDatabase } from '@/lib/mongodb/connection'
import { DEFAULT_SETTINGS, getSettingsModel } from '@/lib/mongodb/models'
import { UPLOAD_LIMITS } from '@/lib/upload-config'

const THUMBNAIL_MAX_SIZE = 640

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }
  return Math.min(max, Math.max(min, Math.round(value)))
}

function normalizeAllowedTypes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [...UPLOAD_LIMITS.ALLOWED_TYPES]
  }

  const uniqueTypes = Array.from(new Set(value.filter((item): item is string => typeof item === 'string')))
  return uniqueTypes.length > 0 ? uniqueTypes : [...UPLOAD_LIMITS.ALLOWED_TYPES]
}

// 50 -> 1.2MB, 80 -> 2.2MB, 100 -> 2.8MB
function qualityToTargetMB(quality: number): number {
  const normalized = (quality - 50) / 50
  const target = 1.2 + (normalized * 1.6)
  return Number(target.toFixed(1))
}

export interface UploadEngineSettings {
  maxFileSizeMB: number
  maxFileSizeBytes: number
  allowedTypes: string[]
  autoApprove: boolean
  compressionQuality: number
  mainImageQuality: number
  thumbnailQuality: number
  thumbnailMaxSize: number
  clientCompressionTargetMB: number
  maxWidth: number
  maxHeight: number
}

function buildUploadEngineSettings(uploadSettings: Partial<typeof DEFAULT_SETTINGS.upload>): UploadEngineSettings {
  const defaults = DEFAULT_SETTINGS.upload
  const merged = { ...defaults, ...uploadSettings }

  const compressionQuality = clampNumber(merged.compressionQuality, 50, 100, defaults.compressionQuality)
  const maxFileSizeMB = clampNumber(merged.maxFileSize, 1, 100, defaults.maxFileSize)

  const mainImageQuality = clampNumber(compressionQuality, 70, 98, 90)
  const thumbnailQuality = clampNumber(Math.round(compressionQuality * 0.9), 70, 95, 82)

  return {
    maxFileSizeMB,
    maxFileSizeBytes: maxFileSizeMB * 1024 * 1024,
    allowedTypes: normalizeAllowedTypes(merged.allowedTypes),
    autoApprove: Boolean(merged.autoApprove),
    compressionQuality,
    mainImageQuality,
    thumbnailQuality,
    thumbnailMaxSize: THUMBNAIL_MAX_SIZE,
    clientCompressionTargetMB: qualityToTargetMB(compressionQuality),
    maxWidth: UPLOAD_LIMITS.MAX_WIDTH,
    maxHeight: UPLOAD_LIMITS.MAX_HEIGHT,
  }
}

export async function getUploadEngineSettings(): Promise<UploadEngineSettings> {
  if (process.env.NODE_ENV === 'test') {
    return buildUploadEngineSettings(DEFAULT_SETTINGS.upload)
  }

  let uploadSettings: Partial<typeof DEFAULT_SETTINGS.upload> = DEFAULT_SETTINGS.upload
  try {
    await connectToDatabase()
    const Settings = getSettingsModel()
    const settingsDoc = await Settings.findOne({ key: 'global' }).lean() as { value?: { upload?: Partial<typeof DEFAULT_SETTINGS.upload> } } | null
    uploadSettings = settingsDoc?.value?.upload ? settingsDoc.value.upload : DEFAULT_SETTINGS.upload
  } catch {
    // Fall back to defaults if settings cannot be loaded.
    uploadSettings = DEFAULT_SETTINGS.upload
  }

  return buildUploadEngineSettings(uploadSettings)
}
