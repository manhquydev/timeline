/**
 * Upload Configuration & Limits
 * Centralized configuration for file upload limits and validation
 */

export const UPLOAD_LIMITS = {
  // Maximum number of files per upload session
  MAX_FILES_PER_UPLOAD: 20,

  // Maximum file size (in MB)
  MAX_FILE_SIZE_MB: 100, // Increased for video support

  // Maximum total size for all files in one upload (in MB)
  MAX_TOTAL_SIZE_MB: 500,

  // Target compression size per file (in MB)
  COMPRESSION_TARGET_MB: 1.8,

  // Maximum dimensions for compressed images
  MAX_WIDTH: 2560,
  MAX_HEIGHT: 2560,

  // Supported file types (current pipeline supports images)
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'],
} as const

export const UPLOAD_CONFIG = {
  // Batch upload settings (fallback)
  BATCH_SIZE: 3, // Files per batch
  MAX_BATCH_SIZE_MB: 3.5, // Stay under Vercel 4.5MB limit

  // Direct upload settings (primary)
  ENABLE_DIRECT_UPLOAD: true,
  PRESIGNED_URL_EXPIRY: 3600, // 1 hour in seconds

  // Upload behavior
  ENABLE_AUTO_COMPRESSION: true,
  ENABLE_PROGRESS_TRACKING: true,
  ENABLE_RETRY: true,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const

export const UI_TEXT = {
  UPLOAD_TIPS_TITLE: '💡 Hướng Dẫn Tải Ảnh',
  UPLOAD_TIPS: [
    `Tải lên tối đa ${UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} ảnh mỗi lần`,
    `Mỗi ảnh không quá ${UPLOAD_LIMITS.MAX_FILE_SIZE_MB}MB`,
    'Hỗ trợ định dạng: JPG, PNG, WebP',
    'Ảnh sẽ được tự động nén để tải nhanh hơn',
    'Giữ kết nối mạng ổn định trong quá trình tải',
  ],

  CURRENT_SELECTION: (count: number) =>
    `Đã chọn ${count}/${UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} ảnh`,

  FILE_SIZE_INFO: (sizeMB: number) =>
    `${sizeMB.toFixed(1)}MB`,

  TOTAL_SIZE_INFO: (totalMB: number, maxMB: number) =>
    `Tổng dung lượng: ${totalMB.toFixed(1)}MB / ${maxMB}MB`,

  COMPRESSION_INFO: 'Ảnh sẽ được nén xuống còn ~1.8MB/ảnh để tải nhanh hơn',
} as const

export const ERROR_MESSAGES = {
  // File count errors
  TOO_MANY_FILES: (count: number) => ({
    title: '⚠️ Quá Nhiều Ảnh',
    message: `Bạn đã chọn ${count} ảnh. Vui lòng chọn tối đa ${UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} ảnh mỗi lần.\n\nGợi ý: Chia thành nhiều lần tải lên nếu có nhiều ảnh.`,
    action: 'Bỏ bớt ảnh',
  }),

  NO_FILES_SELECTED: {
    title: '❌ Chưa Chọn Ảnh',
    message: 'Vui lòng chọn ít nhất 1 ảnh để tải lên.',
    action: 'Chọn ảnh',
  },

  // File size errors
  FILE_TOO_LARGE: (fileName: string, sizeMB: number, maxFileSizeMB: number = UPLOAD_LIMITS.MAX_FILE_SIZE_MB) => ({
    title: '⚠️ Ảnh Quá Lớn',
    message: `Ảnh "${fileName}" có dung lượng ${sizeMB.toFixed(1)}MB, vượt quá giới hạn ${maxFileSizeMB}MB.\n\nGợi ý: Nén ảnh trước khi tải lên hoặc chọn ảnh khác có dung lượng nhỏ hơn.`,
    action: 'Xóa ảnh này',
  }),

  TOTAL_SIZE_TOO_LARGE: (totalMB: number) => ({
    title: '⚠️ Tổng Dung Lượng Quá Lớn',
    message: `Tổng dung lượng ${totalMB.toFixed(1)}MB vượt quá giới hạn ${UPLOAD_LIMITS.MAX_TOTAL_SIZE_MB}MB.\n\nGợi ý: Chọn ít ảnh hơn hoặc chia thành nhiều lần tải lên.`,
    action: 'Bớt ảnh',
  }),

  // File type errors
  INVALID_FILE_TYPE: (fileName: string, fileType: string, allowedTypesLabel: string = 'JPG, PNG, WebP, MP4, MOV') => ({
    title: '⚠️ Định Dạng Không Hợp Lệ',
    message: `File "${fileName}" (${fileType}) không hợp lệ.\n\nChỉ hỗ trợ: ${allowedTypesLabel}`,
    action: 'Xóa file này',
  }),

  // Upload errors
  UPLOAD_FAILED: (fileName: string, error: string) => ({
    title: '❌ Tải Lên Thất Bại',
    message: `Không thể tải ảnh "${fileName}".\n\nLỗi: ${error}\n\nGợi ý: Kiểm tra kết nối mạng và thử lại.`,
    action: 'Thử lại',
  }),

  COMPRESSION_FAILED: (fileName: string) => ({
    title: '❌ Không Thể Nén Ảnh',
    message: `Không thể nén ảnh "${fileName}".\n\nGợi ý: Chọn ảnh khác hoặc thử lại.`,
    action: 'Chọn ảnh khác',
  }),

  NETWORK_ERROR: {
    title: '📡 Mất Kết Nối',
    message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.',
    action: 'Thử lại',
  },

  // Partial success
  PARTIAL_SUCCESS: (successCount: number, totalCount: number, failedFiles: string[]) => ({
    title: '⚠️ Tải Lên Một Phần',
    message: `${successCount}/${totalCount} ảnh tải lên thành công.\n\nCác ảnh thất bại:\n${failedFiles.map(f => `• ${f}`).join('\n')}\n\nBạn có muốn thử lại các ảnh thất bại không?`,
    action: 'Thử lại',
  }),
} as const

export const SUCCESS_MESSAGES = {
  UPLOAD_COMPLETE: (count: number) => ({
    title: '✅ Tải Lên Thành Công!',
    message: `${count} ảnh đã được tải lên. Trang sẽ tự động cập nhật...`,
  }),

  COMPRESSION_SUCCESS: (originalMB: number, compressedMB: number, savings: number) => ({
    title: '📦 Đã Nén Ảnh',
    message: `Tiết kiệm ${savings}% dung lượng (${originalMB.toFixed(1)}MB → ${compressedMB.toFixed(1)}MB)`,
  }),
} as const

export const PROGRESS_MESSAGES = {
  VALIDATING: 'Đang kiểm tra ảnh...',
  COMPRESSING: (current: number, total: number) =>
    `Đang nén ảnh ${current}/${total}...`,
  UPLOADING: (current: number, total: number) =>
    `Đang tải ảnh ${current}/${total}...`,
  PROCESSING: 'Đang xử lý ảnh trên server...',
  FINALIZING: 'Hoàn tất...',
} as const

/**
 * Validate file count
 */
export function validateFileCount(count: number): { valid: boolean; error?: any } {
  if (count === 0) {
    return { valid: false, error: ERROR_MESSAGES.NO_FILES_SELECTED }
  }

  if (count > UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD) {
    return { valid: false, error: ERROR_MESSAGES.TOO_MANY_FILES }
  }

  return { valid: true }
}

/**
 * Validate individual file
 */
export interface ValidateFileOptions {
  allowedTypes?: readonly string[]
  maxFileSizeMB?: number
}

export function validateFile(file: File, options?: ValidateFileOptions): { valid: boolean; error?: any } {
  // Check file type
  const allowedTypes = options?.allowedTypes || (UPLOAD_LIMITS.ALLOWED_TYPES as readonly string[])
  if (!allowedTypes.includes(file.type)) {
    const allowedTypesLabel = allowedTypes
      .map((type) => type.replace('image/', '').replace('video/', '').toUpperCase())
      .join(', ')
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE(file.name, file.type, allowedTypesLabel)
    }
  }

  // Check file size
  const maxFileSizeMB = options?.maxFileSizeMB ?? UPLOAD_LIMITS.MAX_FILE_SIZE_MB
  const fileSizeMB = file.size / 1024 / 1024
  if (fileSizeMB > maxFileSizeMB) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE(file.name, fileSizeMB, maxFileSizeMB)
    }
  }

  return { valid: true }
}

/**
 * Validate total size of all files
 */
export function validateTotalSize(files: File[], maxTotalSizeMB: number = UPLOAD_LIMITS.MAX_TOTAL_SIZE_MB): { valid: boolean; error?: any } {
  const totalSizeMB = files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024

  if (totalSizeMB > maxTotalSizeMB) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TOTAL_SIZE_TOO_LARGE(totalSizeMB)
    }
  }

  return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Calculate total size of files
 */
export function calculateTotalSize(files: File[]): { bytes: number; mb: number; formatted: string } {
  const bytes = files.reduce((sum, file) => sum + file.size, 0)
  const mb = bytes / 1024 / 1024
  const formatted = formatFileSize(bytes)

  return { bytes, mb, formatted }
}

/**
 * Estimate compressed size
 */
export function estimateCompressedSize(files: File[]): { bytes: number; mb: number; formatted: string } {
  // Assume 40% of original size after compression
  const originalBytes = files.reduce((sum, file) => sum + file.size, 0)
  const compressedBytes = originalBytes * 0.4
  const mb = compressedBytes / 1024 / 1024
  const formatted = formatFileSize(compressedBytes)

  return { bytes: compressedBytes, mb, formatted }
}


