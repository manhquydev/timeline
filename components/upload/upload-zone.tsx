'use client'

/**
 * @deprecated This component is deprecated and will be removed in a future release.
 * Use `UploadBottomSheet` from '@/components/upload' instead.
 *
 * Migration:
 * - Replace <UploadZone eventId={id} /> with:
 *   <UploadBottomSheet events={[event]} preSelectedEventId={id} trigger={<Button>Upload</Button>} />
 *
 * The new UploadBottomSheet provides:
 * - Mobile-first bottom sheet UI (like Instagram/TikTok)
 * - Step-by-step guided flow
 * - Better code organization (each module < 200 lines)
 * - Same upload functionality via smartUpload
 */

import { useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, CheckCircle2, Camera, Info, AlertCircle, Edit2, Video } from 'lucide-react'
import { ImageEditor } from '@/components/media/image-editor'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ProgressBar } from '@/components/ui/progress-bar'
import { UploadProgressRing } from './upload-progress-ring'
import { UploadSuccessAnimation } from './upload-success-animation'
import { useToast } from '@/hooks/use-toast'
import { useLoadingStore } from '@/lib/stores/loading-store'
import {
  UPLOAD_LIMITS,
  UI_TEXT,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PROGRESS_MESSAGES,
  validateFileCount,
  validateFile,
  validateTotalSize,
  calculateTotalSize,
  formatFileSize,
} from '@/lib/upload-config'
import { smartUpload, DirectUploadProgress } from '@/lib/supabase/direct-upload'

interface UploadZoneProps {
  eventId: string
  onUploadComplete?: () => void
}

interface FileWithPreview extends File {
  preview: string
}

export function UploadZone({ eventId, onUploadComplete }: UploadZoneProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [wishText, setWishText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStatus, setCurrentStatus] = useState('')
  const [fileProgress, setFileProgress] = useState<DirectUploadProgress[]>([])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<{ title: string; message: string; action?: string } | null>(null)
  const [editingFile, setEditingFile] = useState<{ file: FileWithPreview, index: number } | null>(null)

  // Global loading state
  const { setUploading: setGlobalUploading } = useLoadingStore()

  // Calculate total size
  const totalSize = calculateTotalSize(files)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    // Check total count first
    const newTotalCount = files.length + acceptedFiles.length
    const countValidation = validateFileCount(newTotalCount)

    if (!countValidation.valid && countValidation.error) {
      const errorMsg = countValidation.error(newTotalCount)
      setError(errorMsg)
      toast({
        title: errorMsg.title,
        description: errorMsg.message,
        variant: 'destructive',
        duration: 5000,
      })
      return
    }

    const validFiles: FileWithPreview[] = []
    const errors: string[] = []

    // Validate each file
    acceptedFiles.forEach((file) => {
      const validation = validateFile(file)

      if (validation.valid) {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
        validFiles.push(fileWithPreview)
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error.message}`)
        setError(validation.error)
      }
    })

    // Handle rejected files
    rejectedFiles.forEach(({ file, errors: fileErrors }) => {
      const error = fileErrors[0]
      if (error.code === 'file-too-large') {
        const sizeMB = file.size / 1024 / 1024
        const errorMsg = ERROR_MESSAGES.FILE_TOO_LARGE(file.name, sizeMB)
        setError(errorMsg)
        errors.push(errorMsg.message)
      } else if (error.code === 'file-invalid-type') {
        const errorMsg = ERROR_MESSAGES.INVALID_FILE_TYPE(file.name, file.type)
        setError(errorMsg)
        errors.push(errorMsg.message)
      }
    })

    if (errors.length > 0 && errors.length < 3) {
      toast({
        title: '⚠️ Một số file không hợp lệ',
        description: errors.slice(0, 2).join('\n'),
        variant: 'destructive',
        duration: 5000,
      })
    }

    if (validFiles.length > 0) {
      const newFiles = [...files, ...validFiles]

      // Validate total size
      const sizeValidation = validateTotalSize(newFiles)
      if (!sizeValidation.valid && sizeValidation.error) {
        setError(sizeValidation.error)
        toast({
          title: sizeValidation.error.title,
          description: sizeValidation.error.message,
          variant: 'destructive',
          duration: 5000,
        })
        return
      }

      setFiles(newFiles)
    }
  }, [files, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': UPLOAD_LIMITS.ALLOWED_EXTENSIONS.filter(ext => ext.includes('jpg')),
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
    },
    multiple: true,
    maxSize: UPLOAD_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
    setError(null)
  }

  const removeAllFiles = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview))
    setFiles([])
    setError(null)
  }

  const handleEditSave = useCallback((croppedBlob: Blob) => {
    if (!editingFile) return

    const newFile = new File([croppedBlob], editingFile.file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })

    const newFileWithPreview = Object.assign(newFile, {
      preview: URL.createObjectURL(newFile),
    })

    setFiles((prev) => {
      const newFiles = [...prev]
      URL.revokeObjectURL(prev[editingFile.index].preview)
      newFiles[editingFile.index] = newFileWithPreview
      return newFiles
    })

    setEditingFile(null)
  }, [editingFile])

  // Handle camera capture on mobile
  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const capturedFiles = e.target.files
    if (!capturedFiles || capturedFiles.length === 0) return

    onDrop(Array.from(capturedFiles), [])

    // Reset input to allow capturing again
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }, [onDrop])

  const handleUpload = async () => {
    // Validate before upload
    const countValidation = validateFileCount(files.length)
    if (!countValidation.valid && countValidation.error) {
      const errorMsg = typeof countValidation.error === 'function'
        ? countValidation.error(files.length)
        : countValidation.error
      setError(errorMsg)
      toast({
        title: errorMsg.title,
        description: errorMsg.message,
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    setGlobalUploading(true, 0)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)
    setCurrentStatus(PROGRESS_MESSAGES.VALIDATING)

    try {
      // Broadcast upload started
      supabase.channel(`event-${eventId}`).send({
        type: 'broadcast',
        event: 'message',
        payload: {
          type: 'upload_started',
          user_name: 'Ai đó',
          count: files.length
        }
      })

      // Use smart upload (direct with fallback)
      const result = await smartUpload({
        eventId,
        files,
        wishText,
        onProgress: (progress) => {
          setFileProgress(progress)

          // Calculate overall progress
          const totalProgress = progress.reduce((sum, p) => sum + p.progress, 0) / progress.length
          setUploadProgress(Math.round(totalProgress))
          setGlobalUploading(true, Math.round(totalProgress))

          // Update status message
          const completedCount = progress.filter(p => p.status === 'completed').length
          const uploadingFile = progress.find(p => p.status === 'uploading')

          if (uploadingFile) {
            setCurrentStatus(PROGRESS_MESSAGES.UPLOADING(completedCount + 1, files.length))
          } else {
            const compressingFile = progress.find(p => p.status === 'compressing')
            if (compressingFile) {
              setCurrentStatus(PROGRESS_MESSAGES.COMPRESSING(completedCount + 1, files.length))
            }
          }
        },
        onFileComplete: (result) => {
          if (!result.success) {
            console.error(`Failed to upload ${result.fileName}:`, result.error)
          }
        },
      })

      setUploadProgress(100)
      setGlobalUploading(true, 100)
      setCurrentStatus(PROGRESS_MESSAGES.FINALIZING)

      // Show results
      if (result.successCount === files.length) {
        // All succeeded
        setSuccess(true)
        const successMsg = SUCCESS_MESSAGES.UPLOAD_COMPLETE(result.successCount)
        toast({
          title: successMsg.title,
          description: `${successMsg.message}\n\n✨ Phương thức: ${result.method === 'direct' ? 'Tải trực tiếp (nhanh)' : 'Tải từng phần'}`,
          duration: 3000,
        })
      } else if (result.successCount > 0) {
        // Partial success
        const failedFiles = fileProgress
          .filter(p => p.status === 'failed')
          .map(p => p.fileName)
        const errorMsg = ERROR_MESSAGES.PARTIAL_SUCCESS(
          result.successCount,
          files.length,
          failedFiles
        )
        setError(errorMsg)
        toast({
          title: errorMsg.title,
          description: errorMsg.message,
          variant: 'destructive',
          duration: 7000,
        })
      } else {
        // All failed
        throw new Error('Tất cả ảnh tải lên thất bại')
      }

      // Clean up successful uploads
      files.forEach((file) => URL.revokeObjectURL(file.preview))
      setFiles([])
      setWishText('')

      // Track success for funnel
      window.dispatchEvent(new CustomEvent('analytics_event', {
        detail: { type: 'upload_success', metadata: { count: files.length } }
      }))

      onUploadComplete?.()

      // Auto-refresh after 1.5 seconds
      setTimeout(() => {
        router.refresh()
      }, 1500)

    } catch (err: any) {
      console.error('Upload error:', err)
      const errorMsg = err.message.includes('network')
        ? ERROR_MESSAGES.NETWORK_ERROR
        : { title: '❌ Lỗi tải lên', message: err.message || 'Vui lòng thử lại' }

      setError(errorMsg)
      setGlobalUploading(false, 0)
      toast({
        title: errorMsg.title,
        description: errorMsg.message,
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setCurrentStatus('')
      setGlobalUploading(false, 0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Guidelines */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-bold">{UI_TEXT.UPLOAD_TIPS_TITLE}</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
            {UI_TEXT.UPLOAD_TIPS.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      {/* Upload Limits Display */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold">
            {UI_TEXT.CURRENT_SELECTION(files.length)}
          </span>
          {files.length > 0 && (
            <span className="text-muted-foreground">
              {UI_TEXT.TOTAL_SIZE_INFO(totalSize.mb, UPLOAD_LIMITS.MAX_TOTAL_SIZE_MB)}
            </span>
          )}
        </div>
        {files.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {UI_TEXT.COMPRESSION_INFO}
          </span>
        )}
      </div>

      {/* Mobile & Desktop Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Enhanced Dropzone with glass morphism */}
        <div
          {...getRootProps()}
          className={`relative overflow-hidden rounded-2xl p-6 md:p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive
            ? 'scale-[1.02]'
            : 'hover:shadow-xl'
            }`}
        >
          <input {...getInputProps()} />

          {/* Glass morphism background */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xl" />

          {/* Animated gradient border on drag */}
          <div
            className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isDragActive ? 'opacity-100' : 'opacity-0'}`}
            style={{
              background: 'linear-gradient(90deg, hsl(270 70% 50%), hsl(210 70% 60%), hsl(270 70% 50%))',
              backgroundSize: '200% 100%',
              animation: isDragActive ? 'gradient-shift 2s linear infinite' : 'none',
              padding: '2px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />

          {/* Dashed border */}
          <div
            className={`absolute inset-0 rounded-2xl border-2 border-dashed transition-all duration-300 ${isDragActive
              ? 'border-primary border-opacity-100 shadow-[0_0_20px_hsl(270_70%_50%/0.3)]'
              : 'border-border/50 hover:border-primary/50'
            }`}
            style={{
              animation: isDragActive ? 'border-dance 0.5s linear infinite' : 'none',
            }}
          />

          {/* Glow effect on drag */}
          {isDragActive && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 animate-pulse" />
          )}

          <div className="relative z-10">
            {/* Icon with gradient background */}
            <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-4 rounded-2xl transition-all duration-300 ${isDragActive
              ? 'bg-gradient-to-br from-primary to-primary/70 scale-110 shadow-lg shadow-primary/30'
              : 'bg-white/80 shadow-md'
              }`}>
              <Upload className={`h-8 w-8 md:h-10 md:w-10 transition-colors ${isDragActive ? 'text-white' : 'text-primary'
                }`} />
            </div>

            {isDragActive ? (
              <p className="text-fluid-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-pulse">
                Thả ảnh vào đây!
              </p>
            ) : (
              <>
                <p className="text-fluid-base md:text-fluid-lg font-bold mb-2">
                  <span className="hidden md:inline">Kéo & thả ảnh vào đây</span>
                  <span className="md:hidden">Chọn ảnh từ thư viện</span>
                </p>
                <p className="text-fluid-xs md:text-fluid-sm text-muted-foreground">
                  <span className="hidden md:inline">hoặc click để chọn • </span>
                  tối đa {UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} file
                </p>
                <p className="text-fluid-xs text-muted-foreground mt-1 md:mt-2">
                  Ảnh (JPG, PNG) hoặc Video (MP4, MOV) • Max {UPLOAD_LIMITS.MAX_FILE_SIZE_MB}MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Mobile Camera Button - Only visible on mobile */}
        <div className="md:hidden">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleCameraCapture}
            className="hidden"
            id="camera-input"
          />
          <label
            htmlFor="camera-input"
            className="touch-target flex flex-col items-center justify-center h-full min-h-[160px] p-6 rounded-2xl cursor-pointer bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-fluid-base font-bold mb-1">Chụp Ảnh</p>
                <p className="text-fluid-xs opacity-90">Mở camera ngay</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* File Preview with animations */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-fluid-base font-bold">
              Ảnh Đã Chọn ({files.length}/{UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeAllFiles}
              className="text-muted-foreground hover:text-destructive"
            >
              Xóa tất cả
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {files.map((file, index) => {
              const progress = fileProgress.find((_, i) => i === index)
              const progressStatus = progress?.status === 'completed' ? 'success' :
                progress?.status === 'failed' ? 'error' :
                progress?.status === 'uploading' || progress?.status === 'compressing' ? 'uploading' : 'idle'

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-white/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {file.type.startsWith('video/') ? (
                      <div key={`video-wrapper-${index}`} suppressHydrationWarning>
                        <video
                          src={file.preview}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          muted
                          loop
                          playsInline
                          onMouseOver={e => e.currentTarget.play()}
                          onMouseOut={e => e.currentTarget.pause()}
                          suppressHydrationWarning
                        />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* Upload progress overlay with UploadProgressRing */}
                    {progress && progress.status !== 'pending' && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <UploadProgressRing
                          progress={progress.progress}
                          status={progressStatus}
                          size="md"
                        />
                      </div>
                    )}

                    {/* File type badge */}
                    <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm">
                      {file.type.startsWith('video/') ? (
                        <Video className="w-4 h-4 text-white" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Remove button with glass effect */}
                    {!uploading && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/40 backdrop-blur-sm border-white/20 hover:bg-red-500"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Edit button */}
                    {!uploading && !file.type.startsWith('video/') && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/40 backdrop-blur-sm border-white/20 hover:bg-white/90 z-10"
                        onClick={() => setEditingFile({ file, index })}
                      >
                        <Edit2 className="h-4 w-4 text-white group-hover:text-primary" />
                      </Button>
                    )}
                  </div>
                  <div className="p-2.5 bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-sm">
                    <p className="text-xs font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-white/60 mt-0.5">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Wish Text with gradient focus */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="wishText" className="text-fluid-sm font-semibold">
            Thêm lời nhắn (tùy chọn)
          </Label>
          <div className="relative">
            <Input
              id="wishText"
              placeholder="Chia sẻ suy nghĩ hoặc lời chúc..."
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              maxLength={500}
              disabled={uploading}
              className="resize-none h-24 text-fluid-sm focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-fluid-xs text-muted-foreground">
              Lời nhắn này sẽ hiển thị cùng ảnh của bạn
            </p>
            <p className="text-fluid-xs font-medium text-muted-foreground">
              {wishText.length}/500
            </p>
          </div>
        </div>
      )}

      {/* Success Message with gradient accent */}
      {success && (
        <>
          <UploadSuccessAnimation show={success} />
          <div className="relative overflow-hidden rounded-xl border border-green-500/50 bg-green-500/10 p-4 animate-scale-in">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
            <div className="flex items-center gap-3 pl-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-fluid-sm text-green-700 font-bold">
                  Tải lên thành công!
                </p>
                <p className="text-fluid-xs text-green-600">
                  Trang sẽ tự động cập nhật để hiển thị ảnh mới...
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error Message with gradient accent */}
      {error && (
        <div className="relative overflow-hidden rounded-xl border border-destructive/50 bg-destructive/10 p-4 animate-scale-in">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />
          <div className="pl-3">
            <p className="text-fluid-sm text-destructive font-bold mb-1">
              {error.title}
            </p>
            <p className="text-fluid-xs text-destructive/80 whitespace-pre-line">
              {error.message}
            </p>
            {error.action && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                onClick={() => setError(null)}
              >
                {error.action}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <ProgressBar
            progress={uploadProgress}
            message={currentStatus}
            showPercentage
            className="animate-scale-in"
          />

          {/* Detailed file progress */}
          {fileProgress.length > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              {fileProgress.filter(p => p.status === 'completed').length} / {files.length} ảnh hoàn tất
              {fileProgress.filter(p => p.status === 'failed').length > 0 && (
                <span className="text-destructive ml-2">
                  • {fileProgress.filter(p => p.status === 'failed').length} thất bại
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Button with gradient & animations */}
      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          data-track="click_upload"
          data-track-meta={JSON.stringify({ filesCount: files.length })}
          disabled={uploading || files.length > UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-bold text-fluid-base py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              {currentStatus || `Đang tải ${files.length} ảnh...`}
            </>
          ) : files.length > UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD ? (
            <>
              <AlertCircle className="h-5 w-5 mr-2" />
              Quá {UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} ảnh
            </>
          ) : (
            <>
              <ImageIcon className="h-5 w-5 mr-2" />
              Tải Lên {files.length} Ảnh
            </>
          )}
        </Button>
      )}

      {/* Image Editor Dialog */}
      {editingFile && (
        <ImageEditor
          imageSrc={editingFile.file.preview}
          isOpen={!!editingFile}
          onClose={() => setEditingFile(null)}
          onSave={handleEditSave}
        />
      )}

      {/* CSS for border animation */}
      <style jsx>{`
        @keyframes border-dance {
          0% { border-color: hsl(270 70% 50%); }
          50% { border-color: hsl(210 70% 60%); }
          100% { border-color: hsl(270 70% 50%); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  )
}
