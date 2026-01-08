import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '@/lib/validations/upload'

/**
 * Magic bytes signatures for file type validation
 */
const FILE_SIGNATURES: Record<string, { bytes: number[]; offset?: number }[]> = {
  'image/jpeg': [{ bytes: [0xFF, 0xD8, 0xFF] }],
  'image/png': [{ bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }],
  'image/gif': [{ bytes: [0x47, 0x49, 0x46, 0x38] }],
  'image/webp': [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }],
  'image/heic': [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }],
  'image/heif': [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }],
  'video/mp4': [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }],
  'video/webm': [{ bytes: [0x1A, 0x45, 0xDF, 0xA3] }],
  'video/quicktime': [{ bytes: [0x66, 0x74, 0x79, 0x70, 0x71, 0x74], offset: 4 }],
}

/**
 * Validate file magic bytes against expected type
 */
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType]
  if (!signatures) {
    // Unknown type - allow but log warning
    console.warn(`No magic bytes signature for MIME type: ${mimeType}`)
    return true
  }

  for (const sig of signatures) {
    const offset = sig.offset || 0
    let matches = true

    for (let i = 0; i < sig.bytes.length; i++) {
      if (buffer[offset + i] !== sig.bytes[i]) {
        matches = false
        break
      }
    }

    if (matches) return true
  }

  return false
}

/**
 * Check if MIME type is allowed for upload
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return (
    ALLOWED_IMAGE_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_TYPES[number]) ||
    ALLOWED_VIDEO_TYPES.includes(mimeType as typeof ALLOWED_VIDEO_TYPES[number])
  )
}

/**
 * Get maximum file size for given MIME type
 */
export function getMaxFileSize(mimeType: string): number {
  if (ALLOWED_VIDEO_TYPES.includes(mimeType as typeof ALLOWED_VIDEO_TYPES[number])) {
    return MAX_VIDEO_SIZE
  }
  return MAX_IMAGE_SIZE
}

/**
 * Sanitize filename to prevent path traversal and special characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = filename.split(/[/\\]/).pop() || 'file'

  // Remove dangerous characters, keep only alphanumeric, dash, underscore, dot
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.') // No double dots
    .replace(/^\./, '_') // No leading dot
    .substring(0, 200) // Limit length

  // Ensure file has an extension
  if (!sanitized.includes('.')) {
    return `${sanitized}.bin`
  }

  return sanitized
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

/**
 * Validate file extension matches MIME type
 */
export function validateExtensionMatchesMime(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename)

  const mimeToExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/heic': ['heic'],
    'image/heif': ['heif'],
    'video/mp4': ['mp4', 'm4v'],
    'video/webm': ['webm'],
    'video/quicktime': ['mov', 'qt'],
  }

  const allowedExtensions = mimeToExtensions[mimeType]
  if (!allowedExtensions) return true // Unknown type, skip validation

  return allowedExtensions.includes(ext)
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Comprehensive file validation
 */
export async function validateUploadedFile(
  file: File,
  buffer: Buffer
): Promise<FileValidationResult> {
  // 1. Check MIME type is allowed
  if (!isAllowedMimeType(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: images (JPEG, PNG, GIF, WebP, HEIC) and videos (MP4, WebM, MOV).`
    }
  }

  // 2. Check file size
  const maxSize = getMaxFileSize(file.type)
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${maxMB}MB).`
    }
  }

  // 3. Validate magic bytes
  if (!validateMagicBytes(buffer, file.type)) {
    return {
      valid: false,
      error: 'File content does not match declared type. File may be corrupted or spoofed.'
    }
  }

  // 4. Validate extension matches MIME type
  if (!validateExtensionMatchesMime(file.name, file.type)) {
    return {
      valid: false,
      error: 'File extension does not match file type.'
    }
  }

  return { valid: true }
}
