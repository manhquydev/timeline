import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Calendar,
  Activity,
  Award,
  BarChart3,
  PieChart,
} from 'lucide-react'
import Link from 'next/link'
import NextDynamic from 'next/dynamic'
import { postRepository, eventRepository } from '@/lib/mongodb/repositories'
import { AdminBottomNav } from '@/components/admin/admin-bottom-nav'

// Lazy load heavy chart component
const AnalyticsCharts = NextDynamic(
  () => import('@/components/admin/analytics-charts').then(mod => ({ default: mod.AnalyticsCharts })),
  {
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-80 bg-muted rounded-lg" />
        <div className="h-80 bg-muted rounded-lg" />
        <div className="h-80 bg-muted rounded-lg lg:col-span-2" />
      </div>
    ),
  }
)

export const metadata = {
  title: 'Thống Kê & Phân Tích | Timeline Teky Hoàng Mai',
  description: 'Xem các số liệu và báo cáo chi tiết',
}

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  // Fetch data from MongoDB
  const Post = (await import('@/lib/mongodb/models')).Post
  const Event = (await import('@/lib/mongodb/models')).Event

  const [allPosts, allEvents] = await Promise.all([
    Post.find().lean(),
    Event.find().lean(),
  ])

  // Get user profiles for contributor data
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, total_uploads')
    .order('total_uploads', { ascending: false })
    .limit(10)

  // Calculate statistics
  const totalPosts = allPosts.length
  const approvedPosts = allPosts.filter((p: any) => p.status === 'approved').length
  const pendingPosts = allPosts.filter((p: any) => p.status === 'pending').length
  const totalEvents = allEvents.length
  const openEvents = allEvents.filter((e: any) => e.status === 'open').length

  // Get unique contributors
  const uniqueContributors = new Set(allPosts.filter((p: any) => p.user_id).map((p: any) => p.user_id))
  const totalContributors = uniqueContributors.size

  // Calculate growth metrics (last 30 days vs previous 30 days)
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const prev30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const postsLast30Days = allPosts.filter((p: any) => new Date(p.uploaded_at) >= last30Days).length
  const postsPrev30Days = allPosts.filter(
    (p: any) => new Date(p.uploaded_at) >= prev30Days && new Date(p.uploaded_at) < last30Days
  ).length

  const postsGrowth = postsPrev30Days > 0
    ? Math.round(((postsLast30Days - postsPrev30Days) / postsPrev30Days) * 100)
    : 0

  // Event growth
  const eventsLast30Days = allEvents.filter((e: any) => new Date(e.created_at) >= last30Days).length
  const eventsPrev30Days = allEvents.filter(
    (e: any) => new Date(e.created_at) >= prev30Days && new Date(e.created_at) < last30Days
  ).length

  const eventsGrowth = eventsPrev30Days > 0
    ? Math.round(((eventsLast30Days - eventsPrev30Days) / eventsPrev30Days) * 100)
    : 0

  // Engagement rate (approved posts / total posts)
  const engagementRate = totalPosts > 0
    ? Math.round((approvedPosts / totalPosts) * 100)
    : 0

  const stats = [
    {
      title: 'Tổng Bài Đăng',
      value: totalPosts,
      change: `+${postsGrowth}%`,
      changeType: postsGrowth >= 0 ? 'positive' : 'negative',
      icon: ImageIcon,
      gradient: 'gradient-1',
    },
    {
      title: 'Sự Kiện Hoạt Động',
      value: openEvents,
      change: `+${eventsGrowth}%`,
      changeType: eventsGrowth >= 0 ? 'positive' : 'negative',
      icon: Calendar,
      gradient: 'gradient-2',
    },
    {
      title: 'Người Đóng Góp',
      value: totalContributors,
      change: `${uniqueContributors.size} users`,
      changeType: 'neutral',
      icon: Users,
      gradient: 'gradient-3',
    },
    {
      title: 'Tỷ Lệ Duyệt',
      value: `${engagementRate}%`,
      change: `${approvedPosts}/${totalPosts} posts`,
      changeType: engagementRate >= 80 ? 'positive' : 'negative',
      icon: Activity,
      gradient: 'gradient-4',
    },
  ]

  // Prepare data for charts
  const postsOverTime = allPosts.reduce((acc: any, post: any) => {
    const date = new Date(post.uploaded_at).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
    })
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const eventsByStatus = {
    draft: allEvents.filter((e: any) => e.status === 'draft').length,
    open: allEvents.filter((e: any) => e.status === 'open').length,
    closed: allEvents.filter((e: any) => e.status === 'closed').length,
    archived: allEvents.filter((e: any) => e.status === 'archived').length,
  }

  const postsByStatus = {
    pending: pendingPosts,
    approved: approvedPosts,
    rejected: allPosts.filter((p: any) => p.status === 'rejected').length,
  }

  const topContributors = profiles?.map((p: any) => ({
    name: p.full_name || p.email || 'Unknown',
    uploads: p.total_uploads,
  })) || []

  // Fetch advanced metrics from AnalyticsRepository
  const { analyticsRepository } = await import('@/lib/mongodb/repositories')
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [summaryStats, deviceStats, topPages] = await Promise.all([
    analyticsRepository.getSummaryStats(startDate, now),
    analyticsRepository.getDeviceBreakdown(startDate, now),
    analyticsRepository.getTopPages(startDate, now, 5),
  ])

  // Process advanced stats
  const pageViewStats = summaryStats.find((s: any) => s.type === 'page_view') || { count: 0, uniqueUsersCount: 0 }
  const uploadStats = summaryStats.find((s: any) => s.type === 'upload') || { count: 0 }

  const deviceBreakdown = deviceStats.map((d: any) => ({
    label: d._id === 'unknown' ? 'Khác' : d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.count,
    color: d._id === 'mobile' ? 'bg-blue-500' : d._id === 'desktop' ? 'bg-purple-500' : 'bg-gray-400'
  }))

  const funnelSteps = ['page_view', 'click_upload', 'upload_success']
  const uploadFunnel = await analyticsRepository.getFunnelStats(startDate, now, funnelSteps)

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
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
            <h1 className="admin-header-mobile font-bold">Thống Kê & Phân Tích</h1>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm md:text-base">
              Xem các số liệu và xu hướng của hệ thống (Dữ liệu 30 ngày gần nhất)
            </p>
            <div className="flex gap-2">
              <a
                href="/api/analytics/export?days=30"
                download
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                <PieChart className="w-4 h-4 mr-2" />
                Xuất Báo Cáo
              </a>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const isPositive = stat.changeType === 'positive'
            const isNegative = stat.changeType === 'negative'

            return (
              <Card
                key={index}
                className="overflow-hidden hover-lift border-0 shadow-lg animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                      <div className="flex items-center gap-1">
                        {isPositive && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                        {isNegative && (
                          <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                        )}
                        <span
                          className={`text-sm ${isPositive
                            ? 'text-green-500'
                            : isNegative
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                            }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <AnalyticsCharts
          postsOverTime={postsOverTime}
          eventsByStatus={eventsByStatus}
          postsByStatus={postsByStatus}
          topContributors={topContributors}
          deviceBreakdown={deviceBreakdown}
          topPages={topPages}
        />

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Hành Động Nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/admin/posts" className="block">
                <Button className="w-full h-16 md:h-20 text-base md:text-lg" variant="outline">
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
                    <span>Duyệt Nội Dung</span>
                    {pendingPosts > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                        {pendingPosts} chờ
                      </span>
                    )}
                  </div>
                </Button>
              </Link>

              <Link href="/admin/events/create" className="block">
                <Button className="w-full h-16 md:h-20 text-base md:text-lg gradient-1" variant="outline">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                    <span>Tạo Sự Kiện</span>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/users" className="block">
                <Button className="w-full h-16 md:h-20 text-base md:text-lg" variant="outline">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                    <span>Quản Lý Users</span>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </main>
  )
}
