'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Post } from '@/lib/types'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { VirtualPhotoGrid } from '@/components/photos/virtual-photo-grid'
import { PinboardUserGrid } from '@/components/photos/pinboard-user-grid'
import { SmartAlbumView } from '@/components/albums/smart-album-view'
import { PhotoFilterBar, PhotoFilterType, PhotoSortType } from '@/components/photos/photo-filter-bar'
import { Button } from '@/components/ui/button'
import { useRealtimeCollaboration } from '@/hooks/use-realtime-collaboration'
import { Badge } from '@/components/ui/badge'
import { PresenceAvatarGroup } from '@/components/wall/presence-avatar-group'
import { useToast } from '@/hooks/use-toast'
import { ActivityFeed } from '@/components/wall/activity-feed'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Bell, LayoutGrid, Users, Zap, Calendar, Search, Loader2 } from 'lucide-react'
import { SmartSearchBar } from '@/components/search/smart-search-bar'
import { PhotoLightbox } from '@/components/photos/photo-lightbox'
import { useInfinitePosts } from '@/lib/hooks/use-infinite-posts'
import { useInView } from 'react-intersection-observer'

// Threshold for switching to virtual grid (performance optimization)
const VIRTUAL_GRID_THRESHOLD = 100

interface EventPhotosProps {
  initialPosts: Post[]
  eventId: string
  userName?: string
  userId?: string
  avatarUrl?: string
  initialNextCursor?: string | null
}

export function EventPhotos({ initialPosts, eventId, userName, userId, avatarUrl, initialNextCursor }: EventPhotosProps) {
  // Use TanStack Query for infinite scroll with caching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfinitePosts({
    eventId,
    limit: 20,
    enabled: true,
  })

  // Flatten pages to get all posts, fallback to initialPosts for SSR
  const queryPosts = useMemo(() => {
    if (!data?.pages) return initialPosts
    return data.pages.flatMap(page => page.posts)
  }, [data?.pages, initialPosts])

  // Local state for real-time updates (merged with query data)
  const [realtimePosts, setRealtimePosts] = useState<Post[]>([])

  // Combine query posts with realtime posts
  const posts = useMemo(() => {
    if (realtimePosts.length === 0) return queryPosts
    // Merge realtime posts (newest first) with query posts, avoiding duplicates
    const queryIds = new Set(queryPosts.map(p => p.id))
    const uniqueRealtimePosts = realtimePosts.filter(p => !queryIds.has(p.id))
    return [...uniqueRealtimePosts, ...queryPosts]
  }, [queryPosts, realtimePosts])

  const [searchResults, setSearchResults] = useState<Post[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'users' | 'album' | 'smart'>('users')
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState<PhotoFilterType>('all')
  const [activeSort, setActiveSort] = useState<PhotoSortType>('newest')
  const { toast } = useToast()
  const { lastMessage, onlineUsersCount, isConnected, presence, activities } = useRealtimeCollaboration(eventId, userName, userId, avatarUrl)

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = searchResults || posts

    // Apply filter
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (activeFilter) {
      case 'today':
        filtered = filtered.filter(p => new Date(p.uploaded_at) >= startOfToday)
        break
      case 'week':
        filtered = filtered.filter(p => new Date(p.uploaded_at) >= startOfWeek)
        break
      case 'month':
        filtered = filtered.filter(p => new Date(p.uploaded_at) >= startOfMonth)
        break
      case 'mine':
        if (userId) {
          filtered = filtered.filter(p => p.user_id === userId)
        }
        break
    }

    // Apply sort
    const sorted = [...filtered]
    switch (activeSort) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
        break
      case 'oldest':
        sorted.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime())
        break
      case 'popular':
        sorted.sort((a, b) => ((b.likes_count || 0) + (b.comments_count || 0)) - ((a.likes_count || 0) + (a.comments_count || 0)))
        break
      case 'random':
        // Fisher-Yates shuffle
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]]
        }
        break
    }

    return sorted
  }, [posts, searchResults, activeFilter, activeSort, userId])

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px', // Load 200px before reaching bottom
  })

  // Load more posts when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !searchResults) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, searchResults, fetchNextPage])

  // Handle real-time updates
  useEffect(() => {
    if (!lastMessage) return

    if (lastMessage.type === 'new_posts') {
      const newPosts = lastMessage.payload.posts as Post[]
      setRealtimePosts((prev) => {
        // Filter out posts that might already be in the state
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
    } else if (lastMessage.type === 'post:like') {
      const { postId, userId: likerId } = lastMessage.payload
      // Update in realtime posts if exists there
      setRealtimePosts((prev) => prev.map(post => {
        if (post.id === postId) {
          const isOwnLike = likerId === userId
          return {
            ...post,
            likes_count: (post.likes_count || 0) + 1,
            current_user_liked: isOwnLike ? true : post.current_user_liked
          }
        }
        return post
      }))
    } else if (lastMessage.type === 'post:unlike') {
      const { postId, userId: unlikerId } = lastMessage.payload
      setRealtimePosts((prev) => prev.map(post => {
        if (post.id === postId) {
          const isOwnUnlike = unlikerId === userId
          return {
            ...post,
            likes_count: Math.max(0, (post.likes_count || 0) - 1),
            current_user_liked: isOwnUnlike ? false : post.current_user_liked
          }
        }
        return post
      }))
    } else if (lastMessage.type === 'comment:add') {
      const { postId } = lastMessage.payload
      setRealtimePosts((prev) => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments_count: (post.comments_count || 0) + 1
          }
        }
        return post
      }))
    }
  }, [lastMessage, userId, toast])

  const handlePhotoClick = useCallback((index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }, [])

  return (
    <>
      {/* Photo Filter Bar */}
      <PhotoFilterBar
        activeFilter={activeFilter}
        activeSort={activeSort}
        onFilterChange={setActiveFilter}
        onSortChange={setActiveSort}
        totalPhotos={filteredAndSortedPosts.length}
        userId={userId}
        className="mb-4"
      />

      {/* View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">
            {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'Khoảnh khắc' : 'Khoảnh khắc'}
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
                  <SheetHeader className="sr-only">
                    <SheetTitle>Bảng hoạt động</SheetTitle>
                    <SheetDescription>Xem các hoạt động gần đây của mọi người</SheetDescription>
                  </SheetHeader>
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

      {/* AI Smart Search Bar */}
      <div className="mb-8">
        <SmartSearchBar
          eventId={eventId}
          onSearch={(results, query) => {
            setSearchResults(results)
            setSearchQuery(query)
          }}
          onClear={() => {
            setSearchResults(null)
            setSearchQuery('')
          }}
        />
      </div>

      {searchResults && (
        <div className="mb-6 flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-4 w-4" />
            <span className="font-medium">Kết quả tìm kiếm cho: &quot;{searchQuery}&quot;</span>
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
              {searchResults.length} kết quả
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchResults(null)
              setSearchQuery('')
            }}
            className="text-muted-foreground hover:text-primary"
          >
            Xóa tìm kiếm
          </Button>
        </div>
      )}

      {/* Render based on view mode - using filteredAndSortedPosts */}
      {/* Use VirtualPhotoGrid for large datasets (>100 posts) for better performance */}
      {searchResults ? (
        <PhotoGrid
          posts={filteredAndSortedPosts}
          onPhotoClick={handlePhotoClick}
          showUserInfo={true}
          userId={userId}
        />
      ) : viewMode === 'users' ? (
        <PinboardUserGrid posts={filteredAndSortedPosts} showUserInfo={true} userId={userId} />
      ) : viewMode === 'smart' ? (
        <SmartAlbumView posts={filteredAndSortedPosts} userId={userId} />
      ) : filteredAndSortedPosts.length > VIRTUAL_GRID_THRESHOLD ? (
        // Use VirtualPhotoGrid for large datasets
        <VirtualPhotoGrid
          posts={filteredAndSortedPosts}
          onPhotoClick={handlePhotoClick}
          showUserInfo={true}
          onLoadMore={() => fetchNextPage()}
          hasMore={!!hasNextPage}
          isLoadingMore={isFetchingNextPage}
        />
      ) : (
        <PhotoGrid posts={filteredAndSortedPosts} onPhotoClick={handlePhotoClick} showUserInfo={true} userId={userId} />
      )}

      {/* Infinite Scroll Sentinel - only for regular PhotoGrid */}
      {viewMode === 'album' && !searchResults && hasNextPage && filteredAndSortedPosts.length <= VIRTUAL_GRID_THRESHOLD && (
        <div ref={ref} className="w-full py-8 flex justify-center">
          {isFetchingNextPage && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
        </div>
      )}

      {/* End of content indicator */}
      {viewMode === 'album' && !searchResults && !hasNextPage && posts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Đã hiển thị tất cả {posts.length} ảnh
        </div>
      )}

      {/* Photo Lightbox */}
      <PhotoLightbox
        posts={searchResults || posts}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        showUserInfo={true}
        userId={userId}
      />
    </>
  )
}
