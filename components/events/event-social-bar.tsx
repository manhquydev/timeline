'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface EventSocialBarProps {
  eventId: string
  likesCount?: number
  commentsCount?: number
  className?: string
}

export function EventSocialBar({
  eventId,
  likesCount = 0,
  commentsCount = 0,
  className,
}: EventSocialBarProps) {
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(likesCount)
  const { toast } = useToast()

  const handleLike = () => {
    setLiked(!liked)
    setLocalLikes((prev) => (liked ? prev - 1 : prev + 1))
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Xem sự kiện này',
      text: 'Xem những khoảnh khắc đáng nhớ từ sự kiện này!',
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Đã sao chép liên kết',
          description: 'Liên kết đã được sao chép vào clipboard.',
        })
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Đã sao chép liên kết',
          description: 'Liên kết đã được sao chép vào clipboard.',
        })
      }
    }
  }

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      className={cn(
        'fixed left-0 right-0 fab-bottom-primary z-[45] md:hidden',
        className
      )}
    >
      <div className="mx-4 px-2 py-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
        <div className="flex items-center justify-around">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 h-11"
            onClick={handleLike}
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-all duration-200',
                liked ? 'fill-red-500 text-red-500 scale-110' : 'text-muted-foreground'
              )}
            />
            <span className={cn('text-sm font-medium', liked && 'text-red-500')}>
              {localLikes > 0 ? localLikes : 'Thích'}
            </span>
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-border" />

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 h-11"
            onClick={scrollToComments}
          >
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {commentsCount > 0 ? commentsCount : 'Bình luận'}
            </span>
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-border" />

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 h-11"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Chia sẻ</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
