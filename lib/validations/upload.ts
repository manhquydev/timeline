import { z } from 'zod'
import { idSchema, wishTextSchema } from './common'

// Allowed MIME types for images
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

// Allowed MIME types for videos
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const

// All allowed media types
export const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES] as const

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB

// Magic bytes for file type validation
export const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
  'video/mp4': [0x00, 0x00, 0x00], // ftyp box (variable offset)
}

// Upload request schema
export const uploadSchema = z.object({
  eventId: idSchema,
  wishText: wishTextSchema,
})

// Presigned upload schema
export const presignedUploadSchema = z.object({
  eventId: idSchema,
  fileName: z.string().min(1).max(255),
  fileType: z.enum(ALLOWED_MEDIA_TYPES),
  fileSize: z.number().int().positive().max(MAX_VIDEO_SIZE),
})

// Avatar upload schema
export const avatarUploadSchema = z.object({
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSize: z.number().int().positive().max(MAX_AVATAR_SIZE),
})

// File validation helper
export function validateFileType(buffer: Buffer, expectedType: string): boolean {
  const magicBytes = MAGIC_BYTES[expectedType]
  if (!magicBytes) return true // Unknown type, skip magic byte check

  for (let i = 0; i < magicBytes.length; i++) {
    if (buffer[i] !== magicBytes[i]) return false
  }
  return true
}

// Sanitize filename
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Remove double dots
    .replace(/^\./, '_') // Don't start with dot
    .substring(0, 200) // Limit length
}

// Check if file type is allowed
export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_MEDIA_TYPES.includes(mimeType as typeof ALLOWED_MEDIA_TYPES[number])
}

// Get max size for file type
export function getMaxSizeForType(mimeType: string): number {
  if (ALLOWED_VIDEO_TYPES.includes(mimeType as typeof ALLOWED_VIDEO_TYPES[number])) {
    return MAX_VIDEO_SIZE
  }
  return MAX_IMAGE_SIZE
}

// Type exports
export type Upload = z.infer<typeof uploadSchema>
export type PresignedUpload = z.infer<typeof presignedUploadSchema>
export type AvatarUpload = z.infer<typeof avatarUploadSchema>
