'use client'

import { cn } from '@/lib/utils'
import { UploadProgressRing } from './upload-progress-ring'
import { UploadSuccessAnimation } from './upload-success-animation'
import { CheckCircle2 } from 'lucide-react'
import type { ProgressOverlayProps } from './types'

export function UploadProgressOverlay({
  show,
  progress,
  status,
  fileProgress,
  totalFiles,
  onSuccess,
}: ProgressOverlayProps) {
  if (!show) return null

  const completedCount = fileProgress.filter((p) => p.status === 'completed').length
  const failedCount = fileProgress.filter((p) => p.status === 'failed').length
  const isComplete = progress >= 100 && completedCount === totalFiles
  const hasFailures = failedCount > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      {/* Success Animation */}
      {isComplete && !hasFailures && <UploadSuccessAnimation show={true} onComplete={onSuccess} />}

      {/* Progress Ring */}
      <div className="mb-6">
        {isComplete && !hasFailures ? (
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        ) : (
          <UploadProgressRing
            progress={progress}
            status={isComplete ? 'success' : 'uploading'}
            size="lg"
          />
        )}
      </div>

      {/* Status Message */}
      <p className="text-lg font-semibold text-center mb-2">
        {isComplete && !hasFailures
          ? 'Tải lên thành công!'
          : isComplete && hasFailures
          ? 'Hoàn tất với lỗi'
          : status || 'Đang tải lên...'}
      </p>

      {/* Progress Text */}
      <p className="text-sm text-muted-foreground text-center">
        {completedCount} / {totalFiles} ảnh hoàn tất
        {failedCount > 0 && (
          <span className="text-destructive ml-2">• {failedCount} thất bại</span>
        )}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mt-6">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isComplete && !hasFailures
                ? 'bg-green-500'
                : hasFailures
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-primary to-primary/70'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* File Progress Details */}
      {fileProgress.length > 0 && !isComplete && (
        <div className="mt-6 w-full max-w-sm space-y-2">
          {fileProgress.slice(0, 3).map((fp, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  fp.status === 'completed' && 'bg-green-500',
                  fp.status === 'uploading' && 'bg-primary animate-pulse',
                  fp.status === 'compressing' && 'bg-amber-500 animate-pulse',
                  fp.status === 'failed' && 'bg-destructive',
                  fp.status === 'pending' && 'bg-muted-foreground/30'
                )}
              />
              <span className="flex-1 truncate text-muted-foreground">{fp.fileName}</span>
              <span className="text-muted-foreground tabular-nums">
                {fp.status === 'completed'
                  ? '100%'
                  : fp.status === 'failed'
                  ? 'Lỗi'
                  : `${fp.progress}%`}
              </span>
            </div>
          ))}
          {fileProgress.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{fileProgress.length - 3} ảnh khác
            </p>
          )}
        </div>
      )}

      {/* Success message */}
      {isComplete && !hasFailures && (
        <p className="text-sm text-muted-foreground text-center mt-6 animate-fade-in">
          Trang sẽ tự động cập nhật...
        </p>
      )}
    </div>
  )
}
