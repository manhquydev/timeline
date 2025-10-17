'use client'

import { useState, useCallback } from 'react'
import type { Post } from '@/lib/types'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { PhotoLightbox } from '@/components/photos/photo-lightbox'

interface WallGridProps {
  posts: Post[]
}

export function WallGrid({ posts }: WallGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)

  const handleClose = useCallback(() => {
    setLightboxIndex(-1)
  }, [])

  return (
    <>
      <PhotoGrid posts={posts} onPhotoClick={setLightboxIndex} showUserInfo={false} />

      <PhotoLightbox
        posts={posts}
        initialIndex={lightboxIndex}
        isOpen={lightboxIndex >= 0}
        onClose={handleClose}
        showUserInfo={true}
      />
    </>
  )
}
