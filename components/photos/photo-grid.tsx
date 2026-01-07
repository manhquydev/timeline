'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Masonry from 'react-masonry-css'
import type { Post } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Edit, Loader2 } from 'lucide-react'
import { HeartButton } from '@/components/social/heart-button'
import { ImageEditor } from '@/components/media/image-editor'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import './photo-grid.css'

interface PhotoGridProps {
  posts: Post[]
  onPhotoClick?: (index: number) => void
  showUserInfo?: boolean
}

const breakpointColumns = {
  default: 4,
  1280: 3,
  768: 2,
  640: 1,
}

export function PhotoGrid({ posts, onPhotoClick, showUserInfo = true }: PhotoGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  useState(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    checkAuth()
  })

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

      if (!res.ok) {
        throw new Error('Failed to update image')
      }

      // Close editor and refresh
      setIsEditorOpen(false)
      setEditingPost(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to save edited image:', error)
      // You might want to show a toast here
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageLoad = (postId: string) => {
    setLoadedImages((prev) => new Set(prev).add(postId))
  }

  const handleUserClick = (e: React.MouseEvent, userId: string | null) => {
    e.stopPropagation()
    if (userId) {
      window.location.href = `/wall/${userId}`
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
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {posts.map((post, index) => {
          const gradientClass = gradientClasses[index % gradientClasses.length]

          return (
            <div
              key={post.id}
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-muted hover-lift ripple animate-scale-in touch-manipulation"
              style={{ animationDelay: `${(index % 8) * 0.05}s` }}
              onClick={() => onPhotoClick?.(index)}
            >
              {!loadedImages.has(post.id) && (
                <Skeleton className="absolute inset-0 z-10" />
              )}

              <div className="relative aspect-auto">
                {post.media_type === 'video' ? (
                  <div className="relative w-full h-full bg-black">
                    <video
                      src={post.media_url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      muted
                      loop
                      playsInline
                      onMouseOver={e => e.currentTarget.play()}
                      onMouseOut={e => e.currentTarget.pause()}
                      // Allow loading metadata to show first frame
                      preload="metadata"
                    />
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={post.thumbnail_url || post.media_url}
                    alt={post.wish_text || 'Ảnh sự kiện'}
                    width={post.dimensions?.width || 400}
                    height={post.dimensions?.height || 300}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                    onLoad={() => handleImageLoad(post.id)}
                    loading="lazy"
                    placeholder={post.blurhash ? 'blur' : 'empty'}
                    blurDataURL={post.blurhash || undefined}
                    quality={75}
                  />
                )}
              </div>

              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 ${gradientClass} opacity-0 group-hover:opacity-30 transition-opacity duration-500 mix-blend-multiply`} />

              {/* Info overlay with glass effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto">
                  <div className="flex items-end justify-between gap-2">
                    <div className="space-y-1 overflow-hidden">
                      {post.wish_text && (
                        <p className="text-white text-fluid-sm font-medium line-clamp-2 drop-shadow-lg">
                          {post.wish_text}
                        </p>
                      )}
                      {showUserInfo && post.user_id && post.user_name && (
                        <button
                          onClick={(e) => handleUserClick(e, post.user_id)}
                          className="flex items-center gap-2 text-white/90 hover:text-white text-fluid-xs font-medium transition-colors group/user"
                        >
                          <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm group-hover/user:bg-white/30 transition-colors">
                            <User className="w-3 h-3" />
                          </div>
                          <span className="group-hover/user:underline">bởi {post.user_name}</span>
                        </button>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {currentUser && currentUser.id === post.user_id && (
                        <button
                          onClick={(e) => handleEditClick(e, post)}
                          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
                          title="Chỉnh sửa ảnh"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <HeartButton
                        isLiked={!!post.current_user_liked}
                        likeCount={post.likes_count || 0}
                        onToggle={async () => {
                          // We need a way to call the API without hook if we are inside a map
                          // Or we use the hook inside a wrapper component?
                          // Better to create a small wrapper component "SocialActions" or just use HeartButton with direct fetch
                          const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
                          if (!res.ok) throw new Error('Failed to like')
                        }}
                        className="text-white hover:bg-white/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Corner accent with gradient */}
              <div className={`absolute top-2 right-2 w-8 h-8 ${gradientClass} rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-300 blur-xl`} />
            </div>
          )
        })}
      </Masonry>

      {
        editingPost && (
          <ImageEditor
            imageSrc={editingPost.media_url}
            isOpen={isEditorOpen}
            onClose={() => {
              setIsEditorOpen(false)
              setEditingPost(null)
            }}
            onSave={handleSaveEditedImage}
          />
        )
      }

      {
        isSaving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-lg flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="font-medium">Đang lưu thay đổi...</span>
            </div>
          </div>
        )
      }
    </>
  )
}

function SocialActionsWrapper({ post }: { post: Post }) {
  // Helper if needed, but simple fetch in onClick is fine for now
  return null
}

export function PhotoGridSkeleton() {
  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="relative w-full h-64 rounded-xl overflow-hidden animate-scale-in"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <Skeleton className="w-full h-full" />
          {/* Gradient shimmer effect */}
          <div className={`absolute inset-0 ${gradientClasses[i % gradientClasses.length]} opacity-10 animate-pulse`} />
        </div>
      ))}
    </Masonry>
  )
}
