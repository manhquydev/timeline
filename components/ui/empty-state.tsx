'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Camera,
  Image as ImageIcon,
  Users,
  Calendar,
  Heart,
  MessageCircle,
  Search,
  Upload,
  FolderOpen,
  Bell,
  Sparkles,
} from 'lucide-react'

type EmptyStateVariant =
  | 'no-photos'
  | 'no-events'
  | 'no-results'
  | 'no-comments'
  | 'no-likes'
  | 'no-notifications'
  | 'no-uploads'
  | 'no-users'
  | 'generic'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  className?: string
  children?: ReactNode
}

const variantConfig: Record<
  EmptyStateVariant,
  {
    icon: typeof Camera
    defaultTitle: string
    defaultDescription: string
    gradient: string
  }
> = {
  'no-photos': {
    icon: Camera,
    defaultTitle: 'Chưa có ảnh nào',
    defaultDescription: 'Hãy là người đầu tiên chia sẻ khoảnh khắc đáng nhớ!',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  'no-events': {
    icon: Calendar,
    defaultTitle: 'Chưa có sự kiện nào',
    defaultDescription: 'Các sự kiện mới sẽ xuất hiện ở đây.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  'no-results': {
    icon: Search,
    defaultTitle: 'Không tìm thấy kết quả',
    defaultDescription: 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  'no-comments': {
    icon: MessageCircle,
    defaultTitle: 'Chưa có bình luận',
    defaultDescription: 'Hãy là người đầu tiên chia sẻ suy nghĩ!',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  'no-likes': {
    icon: Heart,
    defaultTitle: 'Chưa có lượt thích',
    defaultDescription: 'Những lượt thích đầu tiên sẽ xuất hiện ở đây.',
    gradient: 'from-red-500/20 to-rose-500/20',
  },
  'no-notifications': {
    icon: Bell,
    defaultTitle: 'Không có thông báo mới',
    defaultDescription: 'Bạn đã xem hết tất cả thông báo.',
    gradient: 'from-indigo-500/20 to-purple-500/20',
  },
  'no-uploads': {
    icon: Upload,
    defaultTitle: 'Bạn chưa tải ảnh nào',
    defaultDescription: 'Chia sẻ những khoảnh khắc đáng nhớ của bạn!',
    gradient: 'from-teal-500/20 to-cyan-500/20',
  },
  'no-users': {
    icon: Users,
    defaultTitle: 'Chưa có người tham gia',
    defaultDescription: 'Mời bạn bè tham gia chia sẻ kỷ niệm.',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  generic: {
    icon: FolderOpen,
    defaultTitle: 'Không có dữ liệu',
    defaultDescription: 'Chưa có nội dung nào ở đây.',
    gradient: 'from-gray-500/20 to-slate-500/20',
  },
}

export function EmptyState({
  variant = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  children,
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const displayTitle = title || config.defaultTitle
  const displayDescription = description || config.defaultDescription

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* Animated icon container */}
      <div
        className={cn(
          'relative w-24 h-24 rounded-full flex items-center justify-center mb-6',
          'bg-gradient-to-br',
          config.gradient
        )}
      >
        {/* Floating sparkles */}
        <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary/50 animate-pulse" />
        <Sparkles
          className="absolute -bottom-2 -left-2 w-4 h-4 text-primary/30 animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />

        {/* Main icon */}
        <Icon className="w-10 h-10 text-muted-foreground" />

        {/* Subtle ring animation */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 animate-spin-slow" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>

      {/* Custom children */}
      {children}

      {/* Action button */}
      {(actionLabel && (onAction || actionHref)) && (
        <Button
          onClick={onAction}
          asChild={!!actionHref}
          className="mt-2 gradient-2 hover-lift shadow-md"
        >
          {actionHref ? (
            <Link href={actionHref}>
              <Icon className="w-4 h-4 mr-2" />
              {actionLabel}
            </Link>
          ) : (
            <>
              <Icon className="w-4 h-4 mr-2" />
              {actionLabel}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
