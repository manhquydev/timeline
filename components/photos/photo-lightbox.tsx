'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Video from 'yet-another-react-lightbox/plugins/video'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import type { Post } from '@/lib/types'
import { User, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { HeartButton } from '@/components/social/heart-button'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CommentSection } from '@/components/social/comment-section'

interface PhotoLightboxProps {
  posts: Post[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  showUserInfo?: boolean
}

export function PhotoLightbox({ posts, initialIndex, isOpen, onClose, showUserInfo = true }: PhotoLightboxProps) {
  // Memoize slides array to prevent recreation on every render
  const slides = useMemo(() =>
    posts.map((post) => {
      // Build prominent wish text display
      const wishSection = post.wish_text
        ? `<div style="padding: 1rem; background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%); border-radius: 12px; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
             <p style="font-size: 1.1rem; font-style: italic; color: #1f2937; line-height: 1.6; margin: 0; font-family: 'Segoe Print', 'Comic Sans MS', cursive;">
               "${post.wish_text}"
             </p>
           </div>`
        : ''

      // Build user info section
      const userSection = showUserInfo && post.user_id && post.user_name
        ? `<div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 8px; backdrop-filter: blur(10px);">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
             </svg>
             <span style="font-size: 0.9rem; opacity: 0.9;">Bởi ${post.user_name}</span>
           </div>`
        : ''

      if (post.media_type === 'video') {
        return {
          type: 'video' as const,
          sources: [
            {
              src: post.media_url,
              type: post.media_url.endsWith('.mov') ? 'video/quicktime' : 'video/mp4',
            },
          ],
          width: post.dimensions?.width || 1280,
          height: post.dimensions?.height || 720,
          poster: post.thumbnail_url || undefined,
          description: `${wishSection}${userSection}`,
        }
      }

      return {
        src: post.media_url,
        alt: post.wish_text || 'Ảnh sự kiện',
        width: post.dimensions?.width || 1200,
        height: post.dimensions?.height || 800,
        title: post.wish_text || undefined,
        description: `${wishSection}${userSection}`,
      }
    }),
    [posts, showUserInfo]
  )

  // Memoize config objects to prevent recreation
  const animationConfig = useMemo(() => ({
    fade: 300,
    swipe: 300,
  }), [])

  const controllerConfig = useMemo(() => ({
    closeOnBackdropClick: true,
    closeOnPullDown: true,
    closeOnPullUp: false,
  }), [])

  const carouselConfig = useMemo(() => ({
    finite: false,
    preload: 2,
    padding: 16,
    spacing: 16,
  }), [])

  const stylesConfig = useMemo(() => ({
    container: {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
    },
    button: {
      filter: 'none',
    },
    captionsTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
    },
    captionsDescription: {
      fontSize: '1rem',
      lineHeight: '1.6',
    },
  }), [])

  // State to track current slide index
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  // Use conditional rendering instead of open prop to avoid unmount issues
  if (!isOpen) return null

  const currentPost = posts[currentIndex]

  return (
    <>
      <Lightbox
        open={true}
        close={onClose}
        slides={slides}
        index={currentIndex}
        on={{
          view: ({ index }) => setCurrentIndex(index)
        }}
        animation={animationConfig}
        controller={controllerConfig}
        carousel={carouselConfig}
        styles={stylesConfig}
        plugins={[Captions, Video]}
      />

      {/* Social Overlay */}
      <div className="fixed bottom-4 right-4 z-[2000] flex flex-col gap-4 items-center">
        {currentPost && (
          <>
            <div className="flex flex-col items-center gap-1">
              <HeartButton
                isLiked={!!currentPost.current_user_liked}
                likeCount={currentPost.likes_count || 0}
                onToggle={async () => {
                  const res = await fetch(`/api/posts/${currentPost.id}/like`, { method: 'POST' })
                  if (!res.ok) throw new Error('Failed to like')
                }}
                className="text-white bg-black/50 hover:bg-black/70 p-3 rounded-full backdrop-blur-md w-12 h-12"
              />
              {/* Optional: Show like count below if desired, but HeartButton handles it inside if designed that way. 
                        The current HeartButton design shows count next to it or inside.
                        Let's check HeartButton implementation. It renders Button with Heart and span for count.
                        The className passed to HeartButton applies to the Button. 
                        We might need to style it to look good floating.
                    */}
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-md w-12 h-12"
                onClick={() => setIsCommentsOpen(true)}
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              <span className="text-white text-xs font-medium drop-shadow-md">
                {currentPost.comments_count || 0}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Comments Sheet */}
      <Sheet open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <SheetContent side="right" className="z-[2001] w-full sm:w-[540px] p-0 flex flex-col bg-background/95 backdrop-blur-md border-l border-border/50">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Comments</SheetTitle>
            <SheetDescription className="sr-only">
              Bình luận về bài đăng này
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            {currentPost && (
              <CommentSection
                postId={currentPost.id}
              // We might need to pass current user ID here if available in context or props
              // PhotoLightbox doesn't strictly have userId prop, but we can access it via client component or pass it.
              // Ideally we pass userId to PhotoLightbox from parent.
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
