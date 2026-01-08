'use client'

/**
 * Virtual Photo Grid
 * High-performance photo grid using @tanstack/react-virtual
 * Renders only visible items for optimal performance with large datasets
 *
 * Use this component when displaying 100+ photos
 * For smaller datasets, use regular PhotoGrid (better UX with Masonry)
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Image from 'next/image'
import type { Post } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Edit, Loader2 } from 'lucide-react'
import { SocialActions } from '@/components/social/social-actions'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const ImageEditor = dynamic(
  () => import('@/components/media/image-editor').then(mod => mod.ImageEditor),
  { ssr: false }
)

interface VirtualPhotoGridProps {
  posts: Post[]
  onPhotoClick?: (index: number) => void
  showUserInfo?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

// Calculate columns based on viewport width
function useColumns() {
  const [columns, setColumns] = useState(4)

  useEffect(() => {
    function updateColumns() {
      const width = window.innerWidth
      if (width < 640) setColumns(1)
      else if (width < 768) setColumns(2)
      else if (width < 1280) setColumns(3)
      else setColumns(4)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  return columns
}

export function VirtualPhotoGrid({
  posts,
  onPhotoClick,
  showUserInfo = true,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: VirtualPhotoGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const columns = useColumns()
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  // Calculate rows from posts
  const rowCount = Math.ceil(posts.length / columns)

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    checkAuth()
  }, [])

  // Virtualizer for rows
  const virtualizer = useVirtualizer({
    count: rowCount + (hasMore ? 1 : 0), // +1 for load more row
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // Estimated row height
    overscan: 3, // Render 3 extra rows for smooth scrolling
  })

  // Load more when approaching end
  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1)
    if (!lastItem) return

    // If we're at the last row and have more to load
    if (lastItem.index >= rowCount - 1 && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore()
    }
  }, [virtualizer.getVirtualItems(), rowCount, hasMore, isLoadingMore, onLoadMore])

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

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chưa có ảnh nào. Hãy là người đầu tiên chia sẻ!</p>
      </div>
    )
  }

  return (
    <>
      {/* Virtual scroll container */}
      <div
        ref={parentRef}
        className="h-[80vh] overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => {
            const rowIndex = virtualRow.index

            // Load more row
            if (rowIndex >= rowCount) {
              return (
                <div
                  key="load-more"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex items-center justify-center py-8"
                >
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang tải thêm...</span>
                    </div>
                  )}
                </div>
              )
            }

            // Get posts for this row
            const startIndex = rowIndex * columns
            const rowPosts = posts.slice(startIndex, startIndex + columns)

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: '1rem',
                  padding: '0.5rem',
                }}
              >
                {rowPosts.map((post, colIndex) => {
                  const globalIndex = startIndex + colIndex
                  const gradientClass = gradientClasses[globalIndex % gradientClasses.length]

                  return (
                    <div
                      key={post.id}
                      className="group relative cursor-pointer overflow-hidden rounded-xl bg-muted hover-lift touch-manipulation aspect-square"
                      onClick={() => onPhotoClick?.(globalIndex)}
                    >
                      {/* Loading skeleton */}
                      <Skeleton
                        className={`absolute inset-0 z-10 transition-opacity duration-700 ${
                          loadedImages.has(post.id) ? 'opacity-0' : 'opacity-100'
                        }`}
                      />

                      {/* Media content */}
                      <div className="relative w-full h-full">
                        {post.media_type === 'video' ? (
                          <div className="relative w-full h-full bg-black">
                            <video
                              src={post.media_url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              poster={post.thumbnail_url || undefined}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={post.thumbnail_url || post.media_url}
                            alt={post.wish_text || 'Ảnh sự kiện'}
                            fill
                            sizes={`(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw`}
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            onLoad={() => handleImageLoad(post.id)}
                            loading="lazy"
                            placeholder={post.blurhash ? 'blur' : 'empty'}
                            blurDataURL={post.blurhash || undefined}
                            quality={75}
                          />
                        )}
                      </div>

                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 ${gradientClass} opacity-0 group-hover:opacity-30 transition-opacity duration-500 mix-blend-multiply`} />

                      {/* Info overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 pointer-events-auto">
                          <div className="flex items-end justify-between gap-2">
                            <div className="space-y-1 overflow-hidden flex-1 min-w-0">
                              {post.wish_text && (
                                <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-lg">
                                  {post.wish_text}
                                </p>
                              )}
                              {showUserInfo && post.user_id && post.user_name && (
                                <button
                                  onClick={(e) => handleUserClick(e, post.user_id)}
                                  className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-medium transition-colors"
                                >
                                  <User className="w-3 h-3" />
                                  <span className="truncate">bởi {post.user_name}</span>
                                </button>
                              )}
                            </div>

                            <div className="shrink-0 flex items-center gap-1">
                              {currentUser && currentUser.id === post.user_id && (
                                <button
                                  onClick={(e) => handleEditClick(e, post)}
                                  className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
                                  title="Chỉnh sửa ảnh"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <SocialActions
                                post={post}
                                userId={currentUser?.id}
                                onCommentClick={() => onPhotoClick?.(globalIndex)}
                                className="scale-75 origin-right"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Image Editor Modal */}
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

      {/* Saving overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="font-medium">Đang lưu thay đổi...</span>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Skeleton for Virtual Photo Grid
 */
export function VirtualPhotoGridSkeleton({ count = 12 }: { count?: number }) {
  const columns = useColumns()
  const rows = Math.ceil(count / columns)

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      ))}
    </div>
  )
}
