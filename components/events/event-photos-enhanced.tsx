'use client'

import { useState, useCallback } from 'react'
import type { Post } from '@/lib/types'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { PinboardUserGrid } from '@/components/photos/pinboard-user-grid'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Users } from 'lucide-react'

interface EventPhotosProps {
  initialPosts: Post[]
}

export function EventPhotos({ initialPosts }: EventPhotosProps) {
  const [posts] = useState<Post[]>(initialPosts)
  const [viewMode, setViewMode] = useState<'users' | 'album'>('users')

  return (
    <>
      {/* View Mode Switcher */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">
            {posts.length} {posts.length === 1 ? 'Khoảnh khắc' : 'Khoảnh khắc'}
          </h2>
        </div>

        <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
          <Button
            variant={viewMode === 'users' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('users')}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Theo Người
          </Button>
          <Button
            variant={viewMode === 'album' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('album')}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Tất Cả Ảnh
          </Button>
        </div>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'users' ? (
        <PinboardUserGrid posts={posts} showUserInfo={true} />
      ) : (
        <PhotoGrid posts={posts} onPhotoClick={() => {}} showUserInfo={true} />
      )}
    </>
  )
}
