import { compressImage } from '@/lib/image-utils'
import { UPLOAD_CONFIG, UPLOAD_LIMITS, ERROR_MESSAGES } from '@/lib/upload-config'

export interface DirectUploadProgress {
  fileIndex: number
  fileName: string
  progress: number // 0-100
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'failed'
  error?: string
}

export interface DirectUploadResult {
  success: boolean
  fileId: string
  path: string
  fileName: string
  dimensions?: { width: number; height: number }
  error?: string
}

export interface DirectUploadOptions {
  eventId: string
  files: File[]
  wishText?: string
  onProgress?: (progress: DirectUploadProgress[]) => void
  onFileComplete?: (result: DirectUploadResult) => void
}

/**
 * Get image dimensions
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Upload single file directly to Supabase using presigned URL
 */
async function uploadSingleFile(
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'))
    })

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', 'image/webp')
    xhr.send(file)
  })
}

/**
 * Main direct upload function
 */
export async function directUpload({
  eventId,
  files,
  wishText = '',
  onProgress,
  onFileComplete,
}: DirectUploadOptions): Promise<{
  success: boolean
  results: DirectUploadResult[]
  successCount: number
  failCount: number
}> {
  const results: DirectUploadResult[] = []
  const progressState: DirectUploadProgress[] = files.map((file, index) => ({
    fileIndex: index,
    fileName: file.name,
    progress: 0,
    status: 'pending',
  }))

  const updateProgress = (index: number, updates: Partial<DirectUploadProgress>) => {
    progressState[index] = { ...progressState[index], ...updates }
    onProgress?.(progressState)
  }

  try {
    // Step 1: Request presigned URLs
    console.log(`📡 Requesting ${files.length} presigned URLs...`)

    const presignedResponse = await fetch('/api/upload/presigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        fileCount: files.length,
      }),
    })

    if (!presignedResponse.ok) {
      const error = await presignedResponse.json()
      throw new Error(error.error || 'Failed to get upload URLs')
    }

    const { uploadUrls } = await presignedResponse.json()

    // Step 2: Compress and upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const { uploadUrl, fileId, path } = uploadUrls[i]

      try {
        // Get original dimensions
        updateProgress(i, { status: 'compressing', progress: 0 })
        const dimensions = await getImageDimensions(file)

        // Compress image
        console.log(`📦 Compressing ${file.name}...`)
        const compressedFile = await compressImage(file, {
          maxSizeMB: UPLOAD_LIMITS.COMPRESSION_TARGET_MB,
          maxWidthOrHeight: UPLOAD_LIMITS.MAX_WIDTH,
        })

        console.log(
          `✓ Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(
            compressedFile.size /
            1024 /
            1024
          ).toFixed(2)}MB`
        )

        // Upload to Supabase
        updateProgress(i, { status: 'uploading', progress: 0 })
        console.log(`⬆️ Uploading ${file.name} directly to Supabase...`)

        await uploadSingleFile(compressedFile, uploadUrl, (progress) => {
          updateProgress(i, { progress })
        })

        // Success
        updateProgress(i, { status: 'completed', progress: 100 })
        console.log(`✅ Uploaded ${file.name} successfully`)

        const result: DirectUploadResult = {
          success: true,
          fileId,
          path,
          fileName: file.name,
          dimensions,
        }

        results.push(result)
        onFileComplete?.(result)
      } catch (error: any) {
        // Failure
        console.error(`❌ Failed to upload ${file.name}:`, error)
        updateProgress(i, { status: 'failed', progress: 0, error: error.message })

        const result: DirectUploadResult = {
          success: false,
          fileId: '',
          path: '',
          fileName: file.name,
          error: error.message,
        }

        results.push(result)
        onFileComplete?.(result)
      }
    }

    // Step 3: Create post records in database
    const successfulUploads = results.filter((r) => r.success)

    if (successfulUploads.length === 0) {
      throw new Error('No files were successfully uploaded')
    }

    console.log(`📝 Creating post records for ${successfulUploads.length} files...`)

    const createPostsResponse = await fetch('/api/posts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        posts: successfulUploads.map((r) => ({
          fileId: r.fileId,
          path: r.path,
          dimensions: r.dimensions,
        })),
        wishText,
      }),
    })

    if (!createPostsResponse.ok) {
      const error = await createPostsResponse.json()
      throw new Error(error.error || 'Failed to create post records')
    }

    const { successCount, totalCount } = await createPostsResponse.json()

    console.log(`✅ Direct upload complete: ${successCount}/${totalCount} posts created`)

    return {
      success: true,
      results,
      successCount: successfulUploads.length,
      failCount: results.length - successfulUploads.length,
    }
  } catch (error: any) {
    console.error('❌ Direct upload failed:', error)
    throw error
  }
}

/**
 * Fallback to batch upload (legacy method)
 */
async function batchUpload({
  eventId,
  files,
  wishText = '',
  onProgress,
}: {
  eventId: string
  files: File[]
  wishText?: string
  onProgress?: (progress: DirectUploadProgress[]) => void
}): Promise<{ success: boolean; uploadedCount: number }> {
  console.log('⚠️ Using fallback batch upload method')

  const BATCH_SIZE = UPLOAD_CONFIG.BATCH_SIZE
  const batches: File[][] = []

  // Create batches
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    batches.push(files.slice(i, i + BATCH_SIZE))
  }

  let uploadedCount = 0
  const progressState: DirectUploadProgress[] = files.map((file, index) => ({
    fileIndex: index,
    fileName: file.name,
    progress: 0,
    status: 'pending',
  }))

  const updateProgress = (fileIndex: number, updates: Partial<DirectUploadProgress>) => {
    progressState[fileIndex] = { ...progressState[fileIndex], ...updates }
    onProgress?.(progressState)
  }

  // Upload each batch
  let fileOffset = 0
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const formData = new FormData()

    formData.append('eventId', eventId)
    formData.append('wishText', i === 0 ? wishText : '')

    // Compress files first
    for (let j = 0; j < batch.length; j++) {
      const fileIndex = fileOffset + j
      updateProgress(fileIndex, { status: 'compressing' })

      const compressedFile = await compressImage(batch[j], {
        maxSizeMB: UPLOAD_LIMITS.COMPRESSION_TARGET_MB,
        maxWidthOrHeight: UPLOAD_LIMITS.MAX_WIDTH,
      })

      formData.append('files', compressedFile)
      updateProgress(fileIndex, { status: 'uploading', progress: 0 })
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      uploadedCount += data.posts.length

      // Mark batch files as completed
      for (let j = 0; j < batch.length; j++) {
        const fileIndex = fileOffset + j
        updateProgress(fileIndex, { status: 'completed', progress: 100 })
      }
    } catch (error) {
      console.error(`Batch ${i + 1} failed:`, error)

      // Mark batch files as failed
      for (let j = 0; j < batch.length; j++) {
        const fileIndex = fileOffset + j
        updateProgress(fileIndex, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    fileOffset += batch.length
  }

  return {
    success: uploadedCount > 0,
    uploadedCount,
  }
}

/**
 * Smart upload: Try direct upload first, fallback to batch if fails
 */
export async function smartUpload(options: DirectUploadOptions): Promise<{
  success: boolean
  method: 'direct' | 'batch'
  successCount: number
  failCount: number
}> {
  if (!UPLOAD_CONFIG.ENABLE_DIRECT_UPLOAD) {
    // Direct upload disabled, use batch
    const result = await batchUpload(options)
    return {
      success: result.success,
      method: 'batch',
      successCount: result.uploadedCount,
      failCount: options.files.length - result.uploadedCount,
    }
  }

  try {
    // Try direct upload first
    const result = await directUpload(options)
    return {
      success: result.success,
      method: 'direct',
      successCount: result.successCount,
      failCount: result.failCount,
    }
  } catch (error: any) {
    console.warn('Direct upload failed, falling back to batch upload:', error)

    // Fallback to batch upload
    const result = await batchUpload(options)
    return {
      success: result.success,
      method: 'batch',
      successCount: result.uploadedCount,
      failCount: options.files.length - result.uploadedCount,
    }
  }
}
