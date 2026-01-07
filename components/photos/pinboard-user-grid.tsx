'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import type { Post } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User, Images, X } from 'lucide-react'
import { PhotoLightbox } from './photo-lightbox'

interface PinboardUserGridProps {
  posts: Post[]
  showUserInfo?: boolean
}

// Group posts by user
interface UserGroup {
  userId: string | null
  userName: string | null
  wish: string | null
  posts: Post[]
  totalPhotos: number
}

// Pre-defined colors and rotations
const stickyColors = [
  'sticky-yellow',
  'sticky-pink',
  'sticky-blue',
  'sticky-green',
  'sticky-purple',
  'sticky-orange'
]

const rotations = [-2, -1, 0, 1, 2, -3, 3, -1.5, 1.5]

export function PinboardUserGrid({ posts, showUserInfo = true }: PinboardUserGridProps) {
  const [selectedUser, setSelectedUser] = useState<UserGroup | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)

  // Group posts by user_id or user_name
  const userGroups = useMemo(() => {
    const groups = new Map<string, UserGroup>()

    posts.forEach(post => {
      // Use user_id as key, fallback to user_name, fallback to 'anonymous'
      const key = post.user_id || post.user_name || 'anonymous'

      if (!groups.has(key)) {
        groups.set(key, {
          userId: post.user_id || null,
          userName: post.user_name || 'Người dùng ẩn danh',
          wish: post.wish_text || null,
          posts: [],
          totalPhotos: 0
        })
      }

      const group = groups.get(key)!
      group.posts.push(post)
      group.totalPhotos++

      // Use the first non-empty wish text
      if (!group.wish && post.wish_text && post.wish_text.trim()) {
        group.wish = post.wish_text
      }
    })

    return Array.from(groups.values())
  }, [posts])

  const handleUserClick = (user: UserGroup) => {
    setSelectedUser(user)
  }

  const handleCloseDialog = () => {
    setSelectedUser(null)
    setLightboxIndex(-1)
  }

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index)
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
        {/* Grid of user sticky notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-max">
          {userGroups.map((userGroup, index) => {
            const rotation = rotations[index % rotations.length]
            const colorClass = stickyColors[index % stickyColors.length]
            const firstPhoto = userGroup.posts[0]

            return (
              <div
                key={`user-${userGroup.userId || index}`}
                className="group animate-scale-in touch-manipulation cursor-pointer"
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => handleUserClick(userGroup)}
              >
                {/* Sticky note */}
                <div
                  className={`sticky-note ${colorClass} min-h-[320px] flex flex-col relative`}
                  style={{ '--rotation': `${rotation}deg` } as React.CSSProperties}
                >
                  {/* Pin */}
                  <div className="pin" />

                  {/* Preview image collage */}
                  <div className="flex-1 mb-4 mt-6">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white/50 shadow-inner">
                      {/* Show up to 4 photos in grid */}
                      <div className={`grid ${userGroup.totalPhotos === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 h-full`}>
                        {userGroup.posts.slice(0, 4).map((post, i) => (
                          <div key={post.id} className="relative overflow-hidden bg-gray-200">
                            {post.media_type === 'video' ? (
                              <video
                                src={post.media_url}
                                className="object-cover w-full h-full"
                                muted
                                playsInline
                              />
                            ) : (
                              <Image
                                src={post.thumbnail_url || post.media_url}
                                alt=""
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover"
                                loading="lazy"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Photo count badge */}
                      {userGroup.totalPhotos > 4 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Images className="w-3 h-3" />
                          +{userGroup.totalPhotos - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Wish text preview */}
                  {userGroup.wish && (
                    <div className="flex-shrink-0 mb-3">
                      <p className="text-gray-800 text-sm font-handwriting leading-relaxed text-center line-clamp-3">
                        &ldquo;{userGroup.wish}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* User info */}
                  {showUserInfo && (
                    <div className="flex-shrink-0 mt-auto pt-3 border-t border-gray-400/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-white/50">
                            <User className="w-3 h-3 text-gray-700" />
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            {userGroup.userName}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-gray-600">
                          {userGroup.totalPhotos} ảnh
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-lg pointer-events-none" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* User album dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    Album của {selectedUser.userName}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Danh sách ảnh trong album của người dùng
                  </DialogDescription>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.totalPhotos} ảnh
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Wish text full */}
              {selectedUser.wish && (
                <div className="mb-6 p-6 rounded-xl glass-gradient border-2 border-primary/20">
                  <p className="text-lg font-handwriting leading-relaxed text-center italic">
                    &ldquo;{selectedUser.wish}&rdquo;
                  </p>
                </div>
              )}

              {/* Photo grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedUser.posts.map((post, index) => (
                  <div
                    key={post.id}
                    className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg bg-muted hover-lift"
                    onClick={() => handlePhotoClick(index)}
                  >
                    {post.media_type === 'video' ? (
                      <>
                        <video
                          src={post.media_url}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                          muted
                          loop
                          playsInline
                          onMouseOver={e => e.currentTarget.play()}
                          onMouseOut={e => e.currentTarget.pause()}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <Image
                        src={post.thumbnail_url || post.media_url}
                        alt={post.wish_text || ''}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Lightbox for selected user's photos */}
      {selectedUser && lightboxIndex >= 0 && (
        <PhotoLightbox
          posts={selectedUser.posts}
          initialIndex={lightboxIndex}
          isOpen={lightboxIndex >= 0}
          onClose={() => setLightboxIndex(-1)}
          showUserInfo={false}
        />
      )}
    </>
  )
}
