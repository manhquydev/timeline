'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import type { Post } from '@/lib/types'
import { User } from 'lucide-react'

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

  // Use conditional rendering instead of open prop to avoid unmount issues
  if (!isOpen) return null

  return (
    <Lightbox
      open={true}
      close={onClose}
      slides={slides}
      index={initialIndex}
      animation={animationConfig}
      controller={controllerConfig}
      carousel={carouselConfig}
      styles={stylesConfig}
      plugins={[Captions]}
    />
  )
}
