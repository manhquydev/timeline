'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Post } from '@/lib/types'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CommentSection } from '@/components/social/comment-section'
import { ImmersiveLightbox } from './immersive-lightbox'

interface PhotoLightboxProps {
  posts: Post[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  showUserInfo?: boolean
  userId?: string
  /** Optional layoutId for shared element transition */
  layoutId?: string
}

export function PhotoLightbox({
  posts,
  initialIndex,
  isOpen,
  onClose,
  showUserInfo = true,
  userId,
  layoutId,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  // Sync index when initialIndex changes (e.g., opening from different photo)
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const handleCommentClick = useCallback(() => {
    setIsCommentsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsCommentsOpen(false)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  const currentPost = posts[currentIndex]

  return (
    <>
      {/* Immersive lightbox with optional shared element transition */}
      <AnimatePresence mode="wait">
        <ImmersiveLightbox
          photos={posts}
          currentIndex={currentIndex}
          isOpen={isOpen}
          onClose={handleClose}
          onNavigate={handleNavigate}
          userId={userId}
          onCommentClick={handleCommentClick}
          layoutId={layoutId}
        />
      </AnimatePresence>

      {/* Comments Sheet - slides from right */}
      <Sheet open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <SheetContent
          side="right"
          className="z-[2002] w-full sm:w-[540px] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/30 shadow-2xl"
        >
          <SheetHeader className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <SheetTitle className="text-lg font-semibold">Bình luận</SheetTitle>
            <SheetDescription className="sr-only">
              Bình luận về bài đăng này
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            {currentPost && (
              <CommentSection
                postId={currentPost.id}
                eventId={currentPost.event_id}
                userId={userId}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

/**
 * Hook to manage lightbox state with shared element transitions
 */
export function useLightbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [layoutId, setLayoutId] = useState<string | undefined>()

  const openLightbox = useCallback((index: number, id?: string) => {
    setSelectedIndex(index)
    setLayoutId(id)
    setIsOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setIsOpen(false)
    // Delay clearing layoutId for exit animation
    setTimeout(() => setLayoutId(undefined), 300)
  }, [])

  return {
    isOpen,
    selectedIndex,
    layoutId,
    openLightbox,
    closeLightbox,
  }
}
