'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Post {
  id: string
  event_id: string
  media_url: string
  thumbnail_url: string | null
  wish_text: string | null
  status: 'pending' | 'approved' | 'rejected'
  uploaded_at: string
  user_name: string | null
  events: {
    id: string
    title: string
    slug: string
  }
}

interface ModeratorPostListProps {
  pendingPosts: Post[]
  approvedPosts: Post[]
  rejectedPosts: Post[]
}

export function ModeratorPostList({
  pendingPosts,
  approvedPosts,
  rejectedPosts,
}: ModeratorPostListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleUpdateStatus = async (postId: string, status: 'approved' | 'rejected') => {
    setLoading(postId)
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, status }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update post')
      }

      router.refresh()
      setPreviewOpen(false)
    } catch (error: any) {
      alert(error.message || 'Failed to update post')
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderPostCard = (post: Post, showActions: boolean = false) => (
    <div
      key={post.id}
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="aspect-square relative bg-muted">
        <Image
          src={post.thumbnail_url || post.media_url}
          alt={post.wish_text || 'Post image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              setSelectedPost(post)
              setPreviewOpen(true)
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem Chi Tiết
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {post.user_name || 'Anonymous'}
          </span>
          <Badge variant="outline" className="text-xs">
            {post.events.title}
          </Badge>
        </div>
        {post.wish_text && (
          <p className="text-sm mb-2 line-clamp-2">{post.wish_text}</p>
        )}
        <p className="text-xs text-muted-foreground mb-3">
          {formatDate(post.uploaded_at)}
        </p>

        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-green-500 hover:bg-green-600"
              onClick={() => handleUpdateStatus(post.id, 'approved')}
              disabled={loading === post.id}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Duyệt
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => handleUpdateStatus(post.id, 'rejected')}
              disabled={loading === post.id}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Từ Chối
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">
            Chờ Duyệt ({pendingPosts.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Đã Duyệt ({approvedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Đã Từ Chối ({rejectedPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không có bài đăng chờ duyệt</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pendingPosts.map(post => renderPostCard(post, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có bài đăng được duyệt</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {approvedPosts.map(post => renderPostCard(post, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có bài đăng bị từ chối</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rejectedPosts.map(post => renderPostCard(post, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Bài Đăng</DialogTitle>
            <DialogDescription className="sr-only">
              Chi tiết bài đăng đang chờ kiểm duyệt hoặc đã xử lý
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              {/* Image */}
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={selectedPost.media_url}
                  alt={selectedPost.wish_text || 'Post image'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Người đăng</p>
                    <p className="font-semibold">{selectedPost.user_name || 'Anonymous'}</p>
                  </div>
                  <Badge>{selectedPost.status}</Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Sự kiện</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{selectedPost.events.title}</p>
                    <a
                      href={`/events/${selectedPost.events.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>

                {selectedPost.wish_text && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lời nhắn</p>
                    <p className="bg-muted p-3 rounded-lg">{selectedPost.wish_text}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Thời gian đăng</p>
                  <p className="font-semibold">{formatDate(selectedPost.uploaded_at)}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedPost.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => handleUpdateStatus(selectedPost.id, 'approved')}
                    disabled={loading === selectedPost.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt Bài Đăng
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleUpdateStatus(selectedPost.id, 'rejected')}
                    disabled={loading === selectedPost.id}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ Chối
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
