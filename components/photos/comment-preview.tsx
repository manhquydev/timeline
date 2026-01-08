'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MessageCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentPreviewProps {
  postId: string
  commentsCount: number
  onViewAll: () => void
  className?: string
}

interface PreviewComment {
  _id: string
  content: string
  createdAt: string
  author?: {
    name: string
    avatar?: string
  }
}

export function CommentPreview({
  postId,
  commentsCount,
  onViewAll,
  className,
}: CommentPreviewProps) {
  const [comments, setComments] = useState<PreviewComment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (commentsCount === 0) return

    const fetchPreviewComments = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/posts/${postId}/comments?limit=2`)
        if (res.ok) {
          const data = await res.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error('Failed to fetch comment preview:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreviewComments()
  }, [postId, commentsCount])

  if (commentsCount === 0) {
    return (
      <div className={cn('text-center py-3', className)}>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors mx-auto"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Hãy là người đầu tiên bình luận</span>
        </button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Preview Comments */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-white/50 text-sm py-2">
          <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white/70 animate-spin" />
          <span>Đang tải...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.slice(0, 2).map((comment) => (
            <div
              key={comment._id}
              className="flex items-start gap-2 text-white/90"
            >
              <Avatar className="h-6 w-6 border border-white/20">
                <AvatarImage src={comment.author?.avatar} />
                <AvatarFallback className="bg-white/10 text-white text-xs">
                  {comment.author?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-white/90">
                    {comment.author?.name || 'User'}
                  </span>
                  <span className="text-xs text-white/50">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
                <p className="text-sm text-white/80 line-clamp-1">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {commentsCount > 2 && (
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors group"
        >
          <span>Xem tất cả {commentsCount} bình luận</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {commentsCount <= 2 && commentsCount > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors group"
        >
          <span>Thêm bình luận</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  )
}
