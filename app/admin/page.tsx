import { eventRepository } from '@/lib/mongodb/repositories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Image as ImageIcon, Users as UsersTeam } from 'lucide-react'
import Link from 'next/link'
import { StatsOverviewCard } from '@/components/admin/stats-overview-card'
import { QuickActionsGrid } from '@/components/admin/quick-actions-grid'
import { RecentActivityFeed, type Activity } from '@/components/admin/recent-activity-feed'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { Post } from '@/lib/mongodb/models'

export const metadata = {
  title: 'Quản Trị | Timeline Teky Hoàng Mai',
  description: 'Quản lý sự kiện và xem thống kê của Timeline Teky Hoàng Mai',
}

export default async function AdminDashboard() {
  // Auth check is handled in layout.tsx
  let events: any[] = []
  let pendingPostsCount = 0

  try {
    await connectToDatabase()
    events = await eventRepository.findAll('created_at')
    pendingPostsCount = await Post.countDocuments({ status: 'pending' })
  } catch (error) {
    console.error('Error fetching admin data:', error)
  }

  // Calculate stats
  const totalEvents = events?.length || 0
  const totalPhotos = events?.reduce((sum, e) => sum + (e.stats?.total_photos || 0), 0) || 0
  const totalContributors = events?.reduce((sum, e) => sum + (e.stats?.total_contributors || 0), 0) || 0
  const openEvents = events?.filter(e => e.status === 'open').length || 0

  const stats = [
    { title: 'Tổng Sự Kiện', value: totalEvents, iconName: 'calendar' as const, gradient: 'gradient-1' as const, trend: 'up' as const, trendValue: 12 },
    { title: 'Tổng Số Ảnh', value: totalPhotos, iconName: 'image' as const, gradient: 'gradient-2' as const },
    { title: 'Người Đóng Góp', value: totalContributors, iconName: 'users' as const, gradient: 'gradient-3' as const, trend: 'up' as const, trendValue: 8 },
    { title: 'Sự Kiện Đang Mở', value: openEvents, iconName: 'trending-up' as const, gradient: 'gradient-4' as const },
  ]

  // Mock recent activities (in production, fetch from DB)
  const recentActivities: Activity[] = [
    { id: '1', type: 'new_post', message: 'Đã tải lên 3 ảnh mới', user: { name: 'Nguyễn Văn A' }, timestamp: new Date(Date.now() - 300000) },
    { id: '2', type: 'user_signup', message: 'Người dùng mới đăng ký', user: { name: 'Trần Thị B' }, timestamp: new Date(Date.now() - 1800000) },
    { id: '3', type: 'post_approved', message: 'Đã duyệt 5 bài đăng', timestamp: new Date(Date.now() - 3600000) },
    { id: '4', type: 'event_created', message: 'Tạo sự kiện "Họp mặt cuối năm"', timestamp: new Date(Date.now() - 7200000) },
  ]

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500', open: 'bg-green-500', closed: 'bg-blue-500', archived: 'bg-gray-400',
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-8 admin-content-mobile">
        {/* Header */}
        <div>
          <h1 className="admin-header-mobile font-bold mb-2">Bảng Điều Khiển</h1>
          <p className="text-muted-foreground text-sm md:text-base">Quản lý sự kiện và theo dõi hoạt động</p>
        </div>

        {/* Stats Grid - New Component */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatsOverviewCard key={stat.title} {...stat} delay={index * 0.1} />
          ))}
        </div>

        {/* Quick Actions - New Component */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Thao Tác Nhanh</h2>
          <QuickActionsGrid pendingPostsCount={pendingPostsCount} />
        </section>

        {/* Activity Feed & Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - New Component */}
          <Card className="lg:col-span-1 border-0 shadow-xl bg-white/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Hoạt Động Gần Đây</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivityFeed activities={recentActivities} />
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Sự Kiện Gần Đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!events?.length ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chưa có sự kiện nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <Link key={event.id} href={`/admin/events/${event.slug}/edit`} className="block">
                      <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/80 transition-all border border-transparent hover:border-purple-200 hover:-translate-y-0.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{event.title}</h4>
                            <span className={`${statusColors[event.status]} text-white text-xs px-2 py-0.5 rounded-full`}>
                              {event.status === 'open' ? 'Mở' : event.status === 'draft' ? 'Nháp' : event.status === 'closed' ? 'Đóng' : 'Lưu trữ'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />{event.stats?.total_photos || 0}</span>
                            <span className="flex items-center gap-1"><UsersTeam className="w-3.5 h-3.5" />{event.stats?.total_contributors || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
