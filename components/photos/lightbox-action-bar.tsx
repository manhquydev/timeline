'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'
import { CommentPreview } from './comment-preview'

interface LightboxActionBarProps {
  post: Post
  userId?: string
  currentIndex: number
  totalPosts: number
  onLike?: () => void
  onCommentClick?: () => void
  onShare?: () => void
  onInfoClick?: () => void
  onPrev?: () => void
  onNext?: () => void
  className?: string
}

export function LightboxActionBar({
  post,
  userId,
  currentIndex,
  totalPosts,
  onLike,
  onCommentClick,
  onShare,
  onInfoClick,
  onPrev,
  onNext,
  className,
}: LightboxActionBarProps) {
  const [isLiked, setIsLiked] = useState(post.current_user_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [isLiking, setIsLiking] = useState(false)

  // Update state when post changes
  useEffect(() => {
    setIsLiked(post.current_user_liked || false)
    setLikesCount(post.likes_count || 0)
  }, [post.id, post.current_user_liked, post.likes_count])

  const handleLike = async () => {
    if (!userId || isLiking) return

    setIsLiking(true)
    const previouslyLiked = isLiked

    // Optimistic update
    setIsLiked(!isLiked)
    setLikesCount(prev => previouslyLiked ? prev - 1 : prev + 1)

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: previouslyLiked ? 'DELETE' : 'POST',
      })

      if (!res.ok) {
        // Revert on error
        setIsLiked(previouslyLiked)
        setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1)
      }

      onLike?.()
    } catch {
      // Revert on error
      setIsLiked(previouslyLiked)
      setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1)
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.wish_text || 'Chia sẻ ảnh',
          url: window.location.href,
        })
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        onShare?.()
      } catch {
        // Clipboard API failed, ignore silently
      }
    }
  }

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-[2001] safe-bottom', className)}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4 pb-6 pt-12">
        {/* Navigation arrows for mobile */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            disabled={currentIndex <= 0}
            className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={currentIndex >= totalPosts - 1}
            className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* User info and wish text */}
        {(post.user_name || post.wish_text) && (
          <div className="mb-3 max-w-2xl">
            {post.user_name && (
              <div className="flex items-center gap-2 text-white/90 mb-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{post.user_name}</span>
              </div>
            )}
            {post.wish_text && (
              <p className="text-white/80 text-sm md:text-base line-clamp-2 font-handwriting">
                "{post.wish_text}"
              </p>
            )}
          </div>
        )}

        {/* Inline Comment Preview */}
        <div className="mb-4 max-w-2xl border-t border-white/10 pt-3">
          <CommentPreview
            postId={post.id}
            commentsCount={post.comments_count || 0}
            onViewAll={onCommentClick || (() => {})}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Like button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!userId || isLiking}
              className={cn(
                'gap-2 text-white hover:bg-white/10 rounded-full px-4',
                isLiked && 'text-red-400 hover:text-red-300'
              )}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-all',
                  isLiked && 'fill-current scale-110',
                  isLiking && 'animate-pulse'
                )}
              />
              <span className="font-semibold">{likesCount}</span>
            </Button>

            {/* Comment button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCommentClick}
              className="gap-2 text-white hover:bg-white/10 rounded-full px-4"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">{post.comments_count || 0}</span>
            </Button>

            {/* Share button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2 text-white hover:bg-white/10 rounded-full px-4"
            >
              <Share2 className="h-5 w-5" />
              <span className="hidden md:inline font-medium">Chia sẻ</span>
            </Button>
          </div>

          {/* Photo counter */}
          <Badge
            variant="secondary"
            className="bg-white/10 text-white border-none backdrop-blur-sm"
          >
            {currentIndex + 1} / {totalPosts}
          </Badge>
        </div>
      </div>
    </div>
  )
}
