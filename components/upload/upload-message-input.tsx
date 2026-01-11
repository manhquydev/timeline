'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { MessageInputProps } from './types'

export function UploadMessageInput({
  value,
  onChange,
  maxLength = 500,
  disabled = false,
}: MessageInputProps) {
  const remainingChars = maxLength - value.length
  const isNearLimit = remainingChars <= 50
  const isAtLimit = remainingChars <= 0

  return (
    <div className="space-y-2">
      <Label htmlFor="wish-text" className="text-sm font-medium">
        Thêm lời nhắn <span className="text-muted-foreground font-normal">(tùy chọn)</span>
      </Label>

      <div className="relative">
        <Textarea
          id="wish-text"
          placeholder="Chia sẻ suy nghĩ hoặc lời chúc của bạn..."
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          disabled={disabled}
          maxLength={maxLength}
          rows={3}
          className={cn(
            'resize-none text-sm',
            'focus:ring-2 focus:ring-primary/50',
            'transition-all'
          )}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <p className="text-muted-foreground">
          Lời nhắn sẽ hiển thị cùng ảnh của bạn
        </p>
        <p
          className={cn(
            'font-medium tabular-nums',
            isAtLimit && 'text-destructive',
            isNearLimit && !isAtLimit && 'text-amber-500',
            !isNearLimit && 'text-muted-foreground'
          )}
        >
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  )
}
