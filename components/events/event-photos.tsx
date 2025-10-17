'use client'

import { useState, useCallback } from 'react'
import type { Post } from '@/lib/types'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { PhotoLightbox } from '@/components/photos/photo-lightbox'

interface EventPhotosProps {
  initialPosts: Post[]
}

export function EventPhotos({ initialPosts }: EventPhotosProps) {
  const [posts] = useState<Post[]>(initialPosts)
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)

  const handleClose = useCallback(() => {
    setLightboxIndex(-1)
  }, [])

  return (
    <>
      <PhotoGrid posts={posts} onPhotoClick={setLightboxIndex} showUserInfo={true} />

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
