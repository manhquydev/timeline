'use client'

import { useState, useCallback, useMemo } from 'react'
import { VirtuosoGrid } from 'react-virtuoso'
import Image from 'next/image'
import type { Post } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Edit, Loader2 } from 'lucide-react'
import { SocialActions } from '@/components/social/social-actions'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { LazyVideo } from '@/components/media/lazy-video'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const ImageEditor = dynamic(
  () => import('@/components/media/image-editor').then(mod => mod.ImageEditor),
  { ssr: false }
)

interface VirtuosoGalleryProps {
  posts: Post[]
  onPhotoClick?: (index: number) => void
  showUserInfo?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  userId?: string
}

export function VirtuosoGallery({
  posts,
  onPhotoClick,
  showUserInfo = true,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  userId: initialUserId,
}: VirtuosoGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleImageLoad = useCallback((postId: string) => {
    setLoadedImages(prev => new Set(prev).add(postId))
  }, [])

  const handleUserClick = (e: React.MouseEvent, userId: string | null) => {
    e.stopPropagation()
    if (userId) {
      window.location.href = `/wall/${userId}`
    }
  }

  const handleEditClick = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation()
    setEditingPost(post)
    setIsEditorOpen(true)
  }

  const handleSaveEditedImage = async (blob: Blob) => {
    if (!editingPost) return

    try {
      setIsSaving(true)
      const formData = new FormData()
      formData.append('file', blob)

      const res = await fetch(`/api/posts/${editingPost.id}/edit`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed to update image')

      setIsEditorOpen(false)
      setEditingPost(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to save edited image:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Custom components for VirtuosoGrid
  const gridComponents = useMemo(() => ({
    List: motion.div,
    Item: motion.div,
    Footer: () => (
      hasMore ? (
        <div className="flex justify-center p-8 w-full col-span-full">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-muted-foreground bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Đang tải thêm...</span>
            </div>
          ) : (
            <div className="h-20" /> // Spacer for intersection observer
          )}
        </div>
      ) : posts.length > 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm font-medium w-full col-span-full">
          ✨ Đã hiển thị tất cả {posts.length} khoảnh khắc ✨
        </div>
      ) : null
    )
  }), [hasMore, isLoadingMore, posts.length])

  return (
    <>
      <VirtuosoGrid
        style={{ height: '100vh', width: '100%' }}
        totalCount={posts.length}
        overscan={400} // Overscan in pixels
        endReached={onLoadMore}
        components={gridComponents}
        listClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
        itemContent={(index) => {
          const post = posts[index]
          if (!post) return null

          const isVideo = post.media_type === 'video'
          const isOwner = initialUserId === post.user_id

          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted group shadow-xl hover:shadow-2xl transition-all duration-500"
              onClick={() => onPhotoClick?.(index)}
            >
              {/* Media Content */}
              <div className="relative w-full h-full">
                {isVideo ? (
                  <LazyVideo
                    src={post.media_url}
                    poster={post.thumbnail_url}
                    className="w-full h-full object-cover"
                    aspectRatio="portrait"
                    autoPlayOnHover={true}
                  />
                ) : (
                  <>
                    <AnimatePresence>
                      {!loadedImages.has(post.id) && (
                        <motion.div
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10"
                        >
                          <Skeleton className="w-full h-full rounded-none" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Image
                      src={post.thumbnail_url || post.media_url}
                      alt={post.wish_text || 'Event photo'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={cn(
                        "object-cover transition-transform duration-700 group-hover:scale-110",
                        !loadedImages.has(post.id) ? "opacity-0" : "opacity-100"
                      )}
                      onLoad={() => handleImageLoad(post.id)}
                      placeholder={post.blurhash ? 'blur' : 'empty'}
                      blurDataURL={post.blurhash || undefined}
                    />
                  </>
                )}
              </div>

              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                <div className="space-y-4">
                  {post.wish_text && (
                    <p className="text-white text-base font-medium line-clamp-3 leading-relaxed drop-shadow-lg">
                      {post.wish_text}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    {showUserInfo && post.user_id && post.user_name && (
                      <button
                        onClick={(e) => handleUserClick(e, post.user_id)}
                        className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold truncate">@{post.user_name}</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <button
                          onClick={(e) => handleEditClick(e, post)}
                          className="p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors text-white border border-white/30"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <SocialActions
                        post={post}
                        userId={initialUserId}
                        className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Type Badge */}
              {isVideo && (
                <div className="absolute top-4 left-4 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
              )}
            </motion.div>
          )
        }}
      />

      {/* Editor Modals */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <div className="bg-background p-8 rounded-[2rem] flex flex-col items-center gap-4 shadow-2xl border border-white/10">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="font-bold text-lg tracking-tight">Đang lưu kỷ niệm...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {editingPost && (
        <ImageEditor
          imageSrc={editingPost.media_url}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingPost(null)
          }}
          onSave={handleSaveEditedImage}
        />
      )}
    </>
  )
}
