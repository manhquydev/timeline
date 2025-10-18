import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { postRepository, eventRepository } from '@/lib/mongodb/repositories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostManagementList } from '@/components/admin/post-management-list'
import { AdminBottomNav } from '@/components/admin/admin-bottom-nav'

export const metadata = {
  title: 'Quản Lý Nội Dung | Timeline Teky Hoàng Mai',
  description: 'Duyệt và quản lý bài đăng của người dùng',
}

export const dynamic = 'force-dynamic'

export default async function AdminPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  // Fetch all posts from MongoDB
  const Post = (await import('@/lib/mongodb/models')).Post
  const mongoPosts = await Post.find().sort({ uploaded_at: -1 }).lean()

  // Get all events for lookup
  const events = await eventRepository.findAll()
  const eventsMap = new Map(events.map(e => [e.id, { id: e.id, title: e.title, slug: e.slug }]))

  // Combine posts with event data
  const posts = mongoPosts.map((post: any) => ({
    id: post.id,
    media_url: post.media_url,
    thumbnail_url: post.thumbnail_url,
    wish_text: post.wish_text,
    status: post.status,
    uploaded_at: post.uploaded_at.toISOString(),
    user_name: post.user_name,
    events: eventsMap.get(post.event_id) || { id: post.event_id, title: 'Unknown Event', slug: '' },
  }))

  // Count posts by status
  const pendingCount = posts.filter(p => p.status === 'pending').length
  const approvedCount = posts.filter(p => p.status === 'approved').length
  const rejectedCount = posts.filter(p => p.status === 'rejected').length

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 admin-content-mobile">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="hidden lg:block">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Dashboard
            </Button>
          </Link>
          <h1 className="admin-header-mobile font-bold mb-2">Quản Lý Nội Dung</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Duyệt, chỉnh sửa và xóa bài đăng của người dùng
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Chờ Duyệt
                  </p>
                  <h3 className="text-3xl font-bold">{pendingCount}</h3>
                </div>
                <Badge className="bg-yellow-500 text-white">Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Đã Duyệt
                  </p>
                  <h3 className="text-3xl font-bold">{approvedCount}</h3>
                </div>
                <Badge className="bg-green-500 text-white">Approved</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Đã Từ Chối
                  </p>
                  <h3 className="text-3xl font-bold">{rejectedCount}</h3>
                </div>
                <Badge className="bg-red-500 text-white">Rejected</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Tất Cả Bài Đăng</CardTitle>
          </CardHeader>
          <CardContent>
            {!posts || posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chưa có bài đăng nào</p>
              </div>
            ) : (
              <PostManagementList posts={posts} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav pendingPostsCount={pendingCount} />
    </main>
  )
}
