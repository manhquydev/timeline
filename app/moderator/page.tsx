import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isModerator } from '@/lib/auth-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Image as ImageIcon, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { ModeratorPostList } from '@/components/moderator/moderator-post-list'
import { postRepository, eventRepository } from '@/lib/mongodb/repositories'

export const metadata = {
  title: 'Kiểm Duyệt Nội Dung | Timeline Teky Hoàng Mai',
  description: 'Duyệt và quản lý bài đăng',
}

export const dynamic = 'force-dynamic'

export default async function ModeratorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is moderator or higher
  if (!user || !(await isModerator(user.id))) {
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
    event_id: post.event_id,
    media_url: post.media_url,
    thumbnail_url: post.thumbnail_url,
    wish_text: post.wish_text,
    status: post.status,
    uploaded_at: post.uploaded_at.toISOString(),
    user_name: post.user_name,
    events: eventsMap.get(post.event_id) || { id: post.event_id, title: 'Unknown Event', slug: '' },
  }))

  // Filter posts by status
  const pendingPosts = posts.filter(p => p.status === 'pending')
  const approvedPosts = posts.filter(p => p.status === 'approved')
  const rejectedPosts = posts.filter(p => p.status === 'rejected')

  const stats = [
    {
      title: 'Chờ Duyệt',
      value: pendingPosts.length,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Bài đăng cần xem xét',
    },
    {
      title: 'Đã Duyệt',
      value: approvedPosts.length,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Bài đăng đã phê duyệt',
    },
    {
      title: 'Đã Từ Chối',
      value: rejectedPosts.length,
      icon: XCircle,
      color: 'bg-red-500',
      description: 'Bài đăng đã từ chối',
    },
    {
      title: 'Tổng Bài Đăng',
      value: posts.length,
      icon: ImageIcon,
      color: 'bg-blue-500',
      description: 'Tất cả bài đăng',
    },
  ]

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Bảng Điều Khiển Kiểm Duyệt</h1>
          </div>
          <p className="text-muted-foreground">
            Duyệt và quản lý nội dung người dùng đăng tải
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="overflow-hidden hover-lift border-0 shadow-lg animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        {pendingPosts.length > 0 && (
          <Card className="border-0 shadow-xl mb-8 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {pendingPosts.length} bài đăng đang chờ duyệt
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Hãy xem xét và duyệt các bài đăng mới
                    </p>
                  </div>
                </div>
                <Button className="gradient-1" size="lg">
                  Bắt Đầu Duyệt
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Management Tabs */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Quản Lý Bài Đăng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Chưa có bài đăng nào</h3>
                <p className="text-muted-foreground">
                  Bài đăng sẽ xuất hiện khi người dùng upload ảnh
                </p>
              </div>
            ) : (
              <ModeratorPostList
                pendingPosts={pendingPosts}
                approvedPosts={approvedPosts}
                rejectedPosts={rejectedPosts}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
