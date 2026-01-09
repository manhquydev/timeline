'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Check, X, Trash2, Eye, Calendar, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PostWithEvent {
  id: string
  media_url: string
  thumbnail_url: string | null
  wish_text: string | null
  status: 'pending' | 'approved' | 'rejected'
  uploaded_at: string
  user_name?: string | null
  events: {
    id: string
    title: string
    slug: string
  }
}

interface PostManagementListProps {
  posts: PostWithEvent[]
}

export function PostManagementList({ posts }: PostManagementListProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<PostWithEvent | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    return post.status === filter
  })

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when filter changes
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const handleAction = async (postId: string, action: 'approve' | 'reject' | 'delete') => {
    setLoading(postId)
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, action }),
      })

      if (!response.ok) {
        throw new Error('Failed to perform action')
      }

      // Close sheet and dialog
      setSelectedPost(null)
      setShowDeleteDialog(false)

      router.refresh()
    } catch (error) {
      console.error('Error performing action:', error)
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(null)
    }
  }

  const statusColors = {
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
  }

  const statusLabels = {
    pending: 'Chờ Duyệt',
    approved: 'Đã Duyệt',
    rejected: 'Đã Từ Chối',
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('all')}
          className={filter === 'all' ? 'gradient-1' : ''}
        >
          Tất Cả ({posts.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('pending')}
          className={filter === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
        >
          Chờ Duyệt ({posts.filter(p => p.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('approved')}
          className={filter === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          Đã Duyệt ({posts.filter(p => p.status === 'approved').length})
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('rejected')}
          className={filter === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          Đã Từ Chối ({posts.filter(p => p.status === 'rejected').length})
        </Button>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Không có bài đăng nào trong danh mục này
          </p>
        </div>
      ) : (
        <div className="admin-list-mobile">
          {paginatedPosts.map((post) => (
            <div
              key={post.id}
              className={cn(
                "flex flex-col gap-4 rounded-xl border bg-card hover:shadow-lg transition-shadow",
                "sm:flex-row admin-card-mobile"
              )}
            >
              {/* Thumbnail */}
              <div className={cn(
                "relative flex-shrink-0 rounded-lg overflow-hidden bg-muted",
                "admin-thumbnail"
              )}>
                <Image
                  src={post.thumbnail_url || post.media_url}
                  alt={post.wish_text || 'Post image'}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColors[post.status]} text-white`}>
                        {statusLabels[post.status]}
                      </Badge>
                      <Link
                        href={`/events/${post.events.slug}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {post.events.title}
                      </Link>
                    </div>
                    {post.user_name && (
                      <p className="text-sm text-muted-foreground">
                        Đăng bởi: {post.user_name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.uploaded_at).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                {/* Wish Text */}
                {post.wish_text && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm italic">&ldquo;{post.wish_text}&rdquo;</p>
                  </div>
                )}

                {/* Actions */}
                {/* Mobile: Single action button opens sheet */}
                <div className="md:hidden">
                  <Button
                    variant="outline"
                    className="w-full admin-action-button"
                    onClick={() => setSelectedPost(post)}
                    disabled={loading === post.id}
                  >
                    <MoreVertical className="w-4 h-4 mr-2" />
                    Hành Động
                  </Button>
                </div>

                {/* Desktop: Inline action buttons */}
                <div className="hidden md:flex flex-wrap gap-2">
                  <Link href={`/events/${post.events.slug}`} target="_blank">
                    <Button variant="outline" size="sm" className="admin-action-button">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem Sự Kiện
                    </Button>
                  </Link>

                  {post.status !== 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50 admin-action-button"
                      onClick={() => handleAction(post.id, 'approve')}
                      disabled={loading === post.id}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Duyệt
                    </Button>
                  )}

                  {post.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-600 hover:bg-orange-50 admin-action-button"
                      onClick={() => handleAction(post.id, 'reject')}
                      disabled={loading === post.id}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Từ Chối
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 admin-action-button"
                        disabled={loading === post.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác Nhận Xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.
                          Ảnh sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleAction(post.id, 'delete')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Xóa Vĩnh Viễn
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredPosts.length)} / {filteredPosts.length} bài đăng
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Action Sheet */}
      <Sheet open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Quản lý bài đăng</SheetTitle>
            <SheetDescription>
              Chọn hành động để thực hiện với bài đăng này
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 py-4">
            <Link
              href={`/events/${selectedPost?.events.slug}`}
              target="_blank"
              onClick={() => setSelectedPost(null)}
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full admin-sheet-action"
              >
                <Eye className="w-5 h-5" />
                Xem Sự Kiện
              </Button>
            </Link>

            {selectedPost?.status !== 'approved' && (
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white admin-sheet-action"
                onClick={() => selectedPost && handleAction(selectedPost.id, 'approve')}
                disabled={loading === selectedPost?.id}
              >
                <Check className="w-5 h-5" />
                Duyệt bài đăng
              </Button>
            )}

            {selectedPost?.status !== 'rejected' && (
              <Button
                variant="outline"
                size="lg"
                className="w-full text-orange-600 border-orange-600 hover:bg-orange-50 admin-sheet-action"
                onClick={() => selectedPost && handleAction(selectedPost.id, 'reject')}
                disabled={loading === selectedPost?.id}
              >
                <X className="w-5 h-5" />
                Từ chối
              </Button>
            )}

            <Button
              variant="destructive"
              size="lg"
              className="w-full admin-sheet-action"
              onClick={() => {
                setShowDeleteDialog(true)
              }}
              disabled={loading === selectedPost?.id}
            >
              <Trash2 className="w-5 h-5" />
              Xóa vĩnh viễn
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog (for mobile sheet) */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.
              Ảnh sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPost && handleAction(selectedPost.id, 'delete')}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa Vĩnh Viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
