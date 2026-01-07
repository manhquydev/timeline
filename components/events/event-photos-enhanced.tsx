'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Post } from '@/lib/types'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { PinboardUserGrid } from '@/components/photos/pinboard-user-grid'
import { SmartAlbumView } from '@/components/albums/smart-album-view'
import { Button } from '@/components/ui/button'
import { useRealtimeCollaboration } from '@/hooks/use-realtime-collaboration'
import { Badge } from '@/components/ui/badge'
import { PresenceAvatarGroup } from '@/components/wall/presence-avatar-group'
import { useToast } from '@/hooks/use-toast'
import { ActivityFeed } from '@/components/wall/activity-feed'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Bell, LayoutGrid, Users, Zap, Calendar } from 'lucide-react'

interface EventPhotosProps {
  initialPosts: Post[]
  eventId: string
  userName?: string
  userId?: string
}

export function EventPhotos({ initialPosts, eventId, userName, userId, avatarUrl }: EventPhotosProps & { avatarUrl?: string }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [viewMode, setViewMode] = useState<'users' | 'album' | 'smart'>('users')
  const { toast } = useToast()
  const { lastMessage, onlineUsersCount, isConnected, presence, activities } = useRealtimeCollaboration(eventId, userName, userId, avatarUrl)

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'new_posts') {
      const newPosts = lastMessage.payload.posts as Post[]
      setPosts((prev) => {
        // Filter out posts that might already be in the state (e.g., if the user who uploaded is also viewing)
        const filteredNewPosts = newPosts.filter(
          (newPost) => !prev.some((p) => p.id === newPost.id)
        )
        if (filteredNewPosts.length === 0) return prev

        // Notify user about new posts from others
        const firstPost = filteredNewPosts[0]
        if (firstPost.user_id !== userId) {
          toast({
            title: "Mới! 📸",
            description: `${firstPost.user_name || 'Ai đó'} vừa chia sẻ ${filteredNewPosts.length} khoảnh khắc mới.`,
          })
        }

        return [...filteredNewPosts, ...prev]
      })
    }
  }, [lastMessage])

  return (
    <>
      {/* View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">
            {posts.length} {posts.length === 1 ? 'Khoảnh khắc' : 'Khoảnh khắc'}
          </h2>
          {isConnected && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1 border-primary/30 text-primary">
                <Zap className="h-3 w-3 fill-primary" />
                <span>{onlineUsersCount} đang xem</span>
              </Badge>
              <PresenceAvatarGroup presence={presence} />

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative h-8 w-8 rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <Bell className="h-4 w-4 text-primary" />
                    {activities.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="p-0 w-full sm:max-w-md border-l-0 sm:border-l">
                  <ActivityFeed activities={activities} />
                </SheetContent>
              </Sheet>
            </div>
          )}
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
          <Button
            variant={viewMode === 'smart' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('smart')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Smart Album
          </Button>
        </div>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'users' ? (
        <PinboardUserGrid posts={posts} showUserInfo={true} />
      ) : viewMode === 'smart' ? (
        <SmartAlbumView posts={posts} />
      ) : (
        <PhotoGrid posts={posts} onPhotoClick={() => { }} showUserInfo={true} />
      )}
    </>
  )
}
