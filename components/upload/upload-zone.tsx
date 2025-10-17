'use client'

import { useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, CheckCircle2, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { validateImageFile } from '@/lib/image-utils'
import { useToast } from '@/hooks/use-toast'

interface UploadZoneProps {
  eventId: string
  onUploadComplete?: () => void
}

interface FileWithPreview extends File {
  preview: string
}

export function UploadZone({ eventId, onUploadComplete }: UploadZoneProps) {
  const router = useRouter()
  const { toast } = useToast()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [wishText, setWishText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)

    const validFiles: FileWithPreview[] = []
    const errors: string[] = []

    acceptedFiles.forEach((file) => {
      const validation = validateImageFile(file)

      if (validation.valid) {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
        validFiles.push(fileWithPreview)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    setFiles((prev) => [...prev, ...validFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: true,
    maxSize: 20 * 1024 * 1024, // 20MB
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  // Handle camera capture on mobile
  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const capturedFiles = e.target.files
    if (!capturedFiles || capturedFiles.length === 0) return

    setError(null)
    const validFiles: FileWithPreview[] = []
    const errors: string[] = []

    Array.from(capturedFiles).forEach((file) => {
      const validation = validateImageFile(file)

      if (validation.valid) {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
        validFiles.push(fileWithPreview)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    setFiles((prev) => [...prev, ...validFiles])

    // Reset input to allow capturing again
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }, [])

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Vui lòng chọn ít nhất một ảnh')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('eventId', eventId)
      formData.append('wishText', wishText)

      files.forEach((file) => {
        formData.append('files', file)
      })

      // Simulate progress (since fetch doesn't support real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 300)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Tải lên thất bại')
      }

      const data = await response.json()

      // Show success state
      setSuccess(true)

      // Show success toast
      toast({
        title: '✅ Tải lên thành công!',
        description: `${files.length} ảnh đã được tải lên. Trang sẽ tự động cập nhật...`,
        duration: 3000,
      })

      // Clean up
      files.forEach((file) => URL.revokeObjectURL(file.preview))
      setFiles([])
      setWishText('')

      // Call callback if provided
      onUploadComplete?.()

      // Auto-refresh after 1.5 seconds to show new photos
      setTimeout(() => {
        router.refresh()
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Tải lên thất bại')
      toast({
        title: '❌ Lỗi tải lên',
        description: err.message || 'Vui lòng thử lại',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobile & Desktop Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dropzone with gradient */}
        <div
          {...getRootProps()}
          className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-6 md:p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <input {...getInputProps()} />

          {/* Animated gradient background on drag */}
          {isDragActive && (
            <div className="absolute inset-0 gradient-1 opacity-10 animate-pulse" />
          )}

          <div className="relative z-10">
            {/* Icon with gradient background */}
            <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-4 rounded-2xl transition-all duration-300 ${
              isDragActive ? 'gradient-1 scale-110' : 'glass'
            }`}>
              <Upload className={`h-8 w-8 md:h-10 md:w-10 transition-colors ${
                isDragActive ? 'text-white' : 'text-primary'
              }`} />
            </div>

            {isDragActive ? (
              <p className="text-fluid-lg font-bold gradient-1 bg-clip-text text-transparent animate-pulse">
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
                  tối đa 20MB mỗi ảnh
                </p>
                <p className="text-fluid-xs text-muted-foreground mt-1 md:mt-2">
                  Hỗ trợ JPG, PNG, WebP
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
            className="touch-target flex flex-col items-center justify-center h-full p-6 border-2 border-dashed rounded-2xl cursor-pointer gradient-2 text-white hover-lift ripple transition-all"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div>
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
              Ảnh Đã Chọn ({files.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                files.forEach((file) => URL.revokeObjectURL(file.preview))
                setFiles([])
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              Xóa tất cả
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {files.map((file, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover-lift ripple border-0 shadow-lg animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 gradient-1 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />

                    {/* Remove button with glass effect */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 glass-dark border-white/20 hover-lift"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 glass-dark">
                    <p className="text-fluid-xs font-medium text-white truncate">
                      {file.name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
        <div className="relative overflow-hidden rounded-xl border border-green-500/50 bg-green-500/10 p-4 animate-scale-in">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
          <div className="flex items-center gap-3 pl-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-fluid-sm text-green-700 dark:text-green-400 font-bold">
                Tải lên thành công!
              </p>
              <p className="text-fluid-xs text-green-600 dark:text-green-500">
                Trang sẽ tự động cập nhật để hiển thị ảnh mới...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message with gradient accent */}
      {error && (
        <div className="relative overflow-hidden rounded-xl border border-destructive/50 bg-destructive/10 p-4 animate-scale-in">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />
          <p className="text-fluid-sm text-destructive font-medium pl-3 whitespace-pre-line">
            {error}
          </p>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && uploadProgress > 0 && (
        <div className="space-y-2 animate-scale-in">
          <div className="flex items-center justify-between text-fluid-sm">
            <span className="font-medium">Đang tải lên...</span>
            <span className="font-bold gradient-1 bg-clip-text text-transparent">
              {uploadProgress}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-1 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button with gradient & animations */}
      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full gradient-1 hover-lift hover-glow ripple text-white font-bold text-fluid-base py-6 rounded-xl shadow-xl"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="spinner mr-3 !w-5 !h-5 !border-2" />
              Đang tải lên {files.length} ảnh...
            </>
          ) : (
            <>
              <ImageIcon className="h-5 w-5 mr-2" />
              Tải Lên {files.length} Ảnh
            </>
          )}
        </Button>
      )}
    </div>
  )
}
