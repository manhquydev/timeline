'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MessageCircle,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'

interface LightboxControlsProps {
  photo: Post
  currentIndex: number
  total: number
  userId?: string
  onDownload?: () => void
  onShare?: () => void
  onLike?: () => void
  onCommentClick?: () => void
  onPrev?: () => void
  onNext?: () => void
  className?: string
}

export function LightboxControls({
  photo,
  currentIndex,
  total,
  userId,
  onDownload,
  onShare,
  onLike,
  onCommentClick,
  onPrev,
  onNext,
  className,
}: LightboxControlsProps) {
  const [isLiked, setIsLiked] = useState(photo.current_user_liked || false)
  const [likesCount, setLikesCount] = useState(photo.likes_count || 0)
  const [isLiking, setIsLiking] = useState(false)

  // Sync state when photo changes
  useEffect(() => {
    setIsLiked(photo.current_user_liked || false)
    setLikesCount(photo.likes_count || 0)
  }, [photo.id, photo.current_user_liked, photo.likes_count])

  const handleLike = async () => {
    if (!userId || isLiking) return
    setIsLiking(true)
    const wasLiked = isLiked
    setIsLiked(!wasLiked)
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    try {
      const res = await fetch(`/api/posts/${photo.id}/like`, {
        method: wasLiked ? 'DELETE' : 'POST',
      })
      if (!res.ok) {
        setIsLiked(wasLiked)
        setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1))
      }
      onLike?.()
    } catch {
      setIsLiked(wasLiked)
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1))
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: photo.wish_text || 'Chia se anh', url: window.location.href })
      } catch { /* User cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
    onShare?.()
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.media_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photo-${photo.id}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onDownload?.()
    } catch {
      window.open(photo.media_url, '_blank')
    }
  }

  const buttonClass = cn(
    'relative min-w-[48px] min-h-[48px] rounded-full',
    'bg-white/10 backdrop-blur-md text-white border border-white/10',
    'hover:bg-white/20 hover:border-white/20 transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-white/50',
    'shadow-lg shadow-black/20'
  )

  return (
    <motion.div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[2001]',
        'bg-gradient-to-t from-black/80 via-black/60 to-transparent',
        'backdrop-blur-xl border-t border-white/10',
        'safe-bottom',
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              disabled={!onPrev}
              className={cn(buttonClass, 'disabled:opacity-30 disabled:cursor-not-allowed')}
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={!onNext}
              className={cn(buttonClass, 'disabled:opacity-30 disabled:cursor-not-allowed')}
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              disabled={!userId || isLiking}
              className={cn(buttonClass, isLiked && 'text-red-400 bg-red-500/20 border-red-500/30')}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={cn('w-5 h-5 transition-transform', isLiked && 'fill-current scale-110')} />
              {likesCount > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 min-w-[20px] font-medium">
                  {likesCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onCommentClick}
              className={buttonClass}
              aria-label="Comments"
            >
              <MessageCircle className="w-5 h-5" />
              {(photo.comments_count || 0) > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-primary text-white rounded-full px-1.5 min-w-[20px] font-medium">
                  {photo.comments_count}
                </span>
              )}
            </Button>

            <Button variant="ghost" size="icon" onClick={handleShare} className={buttonClass} aria-label="Share">
              <Share2 className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleDownload} className={buttonClass} aria-label="Download">
              <Download className="w-5 h-5" />
            </Button>
          </div>

          {/* Counter */}
          <Badge
            variant="secondary"
            className="bg-white/10 text-white border border-white/20 backdrop-blur-md text-sm px-4 py-1.5 font-medium shadow-lg"
          >
            {currentIndex + 1} / {total}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}
