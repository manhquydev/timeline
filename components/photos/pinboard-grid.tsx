'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Post } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Heart, Edit, Loader2 } from 'lucide-react'
import { ImageEditor } from '@/components/media/image-editor'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PinboardGridProps {
  posts: Post[]
  onPhotoClick?: (index: number) => void
  showUserInfo?: boolean
}

// Pre-defined rotations and colors for natural pinboard look
const stickyColors = [
  'sticky-yellow',
  'sticky-pink',
  'sticky-blue',
  'sticky-green',
  'sticky-purple',
  'sticky-orange'
]

const rotations = [-2, -1, 0, 1, 2, -3, 3, -1.5, 1.5]
const tapeRotations = [-5, 5, -3, 3, 0, -7, 7]

export function PinboardGrid({ posts, onPhotoClick, showUserInfo = true }: PinboardGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

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

      setIsEditorOpen(false)
      setEditingPost(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to save edited image:', error)
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
      <div className="relative min-h-screen py-8 px-4 cork-board rounded-2xl">
        {/* Masonry-like grid with CSS Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-max">
          {posts.map((post, index) => {
            const rotation = rotations[index % rotations.length]
            const tapeRotation = tapeRotations[index % tapeRotations.length]
            const hasWish = post.wish_text && post.wish_text.trim().length > 0

            return (
              <div
                key={post.id}
                className="group relative animate-scale-in touch-manipulation"
                style={{
                  animationDelay: `${(index % 12) * 0.08}s`,
                  minHeight: hasWish ? '320px' : '280px'
                }}
              >
                {/* Polaroid photo with tape */}
                <div
                  className="polaroid"
                  style={{ '--rotation': `${rotation}deg` } as React.CSSProperties}
                  onClick={() => onPhotoClick?.(index)}
                >
                  {/* Tape effect */}
                  <div
                    className="tape tape-top"
                    style={{ '--tape-rotation': `${tapeRotation}deg` } as React.CSSProperties}
                  />

                  {!loadedImages.has(post.id) && (
                    <Skeleton className="absolute inset-0 z-10" />
                  )}

                  <div className="relative aspect-square bg-gray-100 mb-3 overflow-hidden">
                    <Image
                      src={post.thumbnail_url || post.media_url}
                      alt={post.wish_text || 'Ảnh sự kiện'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onLoad={() => handleImageLoad(post.id)}
                      loading="lazy"
                      placeholder={post.blurhash ? 'blur' : 'empty'}
                      blurDataURL={post.blurhash || undefined}
                    />
                  </div>

                  {/* Caption area - always visible if wish exists */}
                  {hasWish && (
                    <div className="text-center px-2 min-h-[60px] flex items-center justify-center">
                      <p className="text-gray-700 text-sm font-handwriting line-clamp-3 leading-relaxed">
                        {post.wish_text}
                      </p>
                    </div>
                  )}

                  {/* User info - bottom of polaroid */}
                  {showUserInfo && post.user_id && post.user_name && (
                    <button
                      onClick={(e) => handleUserClick(e, post.user_id)}
                      className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors text-xs group/user"
                    >
                      <User className="w-3 h-3 text-gray-600" />
                      <span className="text-gray-700 font-medium group-hover/user:underline">
                        {post.user_name}
                      </span>
                    </button>
                  )}

                  {/* Edit Button */}
                  {currentUser && currentUser.id === post.user_id && (
                    <button
                      onClick={(e) => handleEditClick(e, post)}
                      className="absolute bottom-2 right-16 flex items-center justify-center w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors text-gray-700 hover:text-blue-600"
                      title="Chỉnh sửa ảnh"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  )}

                  {/* Like/View indicator */}
                  {post.view_count > 0 && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                      <span className="text-gray-700 font-medium">{post.view_count}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Alternative: Sticky notes for wishes without photos */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts
            .filter(post => post.wish_text && post.wish_text.trim().length > 50) // Long wishes get extra sticky notes
            .slice(0, 4) // Show max 4 extra wish highlights
            .map((post, index) => {
              const rotation = rotations[(index + 5) % rotations.length]
              const colorClass = stickyColors[index % stickyColors.length]

              return (
                <div
                  key={`wish-${post.id}`}
                  className="animate-scale-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div
                    className={`sticky-note ${colorClass} min-h-[200px] flex flex-col`}
                    style={{ '--rotation': `${rotation}deg` } as React.CSSProperties}
                    onClick={() => onPhotoClick?.(posts.indexOf(post))}
                  >
                    {/* Pin */}
                    <div className="pin" />

                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-gray-800 text-base font-handwriting leading-relaxed text-center mb-4">
                        &ldquo;{post.wish_text}&rdquo;
                      </p>
                      {showUserInfo && post.user_name && (
                        <p className="text-gray-600 text-sm text-right font-handwriting">
                          — {post.user_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

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

      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="font-medium">Đang lưu thay đổi...</span>
          </div>
        </div>
      )}
    </>
  )
}

export function PinboardGridSkeleton() {
  return (
    <div className="relative min-h-screen py-8 px-4 cork-board rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="relative animate-scale-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="polaroid" style={{ '--rotation': '0deg' } as React.CSSProperties}>
              <Skeleton className="w-full aspect-square" />
              <div className="h-12 mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
