import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Image as ImageIcon, Users as UsersTeam, TrendingUp, FileCheck, UserCog, BarChart3, Palette, MoreHorizontal, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import type { Event } from '@/lib/types'
import { AdminBottomNav } from '@/components/admin/admin-bottom-nav'

export const metadata = {
  title: 'Quản Trị | Timeline Teky Hoàng Mai',
  description: 'Quản lý sự kiện và xem thống kê của Timeline Teky Hoàng Mai',
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin from database
  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  // Fetch all events from MongoDB
  const events = await eventRepository.findAll('created_at')

  // Count pending posts from MongoDB
  const Post = (await import('@/lib/mongodb/models')).Post
  await (await import('@/lib/mongodb/connection')).connectToDatabase()
  const pendingPostsCount = await Post.countDocuments({ status: 'pending' })

  // Calculate stats
  const totalEvents = events?.length || 0
  const totalPhotos = events?.reduce((sum, e) => sum + (e.stats?.total_photos || 0), 0) || 0
  const totalContributors = events?.reduce((sum, e) => sum + (e.stats?.total_contributors || 0), 0) || 0
  const openEvents = events?.filter(e => e.status === 'open').length || 0

  const stats = [
    {
      title: 'Tổng Sự Kiện',
      value: totalEvents,
      icon: Calendar,
      gradient: 'gradient-1',
    },
    {
      title: 'Tổng Số Ảnh',
      value: totalPhotos,
      icon: ImageIcon,
      gradient: 'gradient-2',
    },
    {
      title: 'Người Đóng Góp',
      value: totalContributors,
      icon: UsersTeam,
      gradient: 'gradient-3',
    },
    {
      title: 'Sự Kiện Đang Mở',
      value: openEvents,
      icon: TrendingUp,
      gradient: 'gradient-4',
    },
  ]

  const statusColors = {
    draft: 'bg-gray-500',
    open: 'bg-green-500',
    closed: 'bg-blue-500',
    archived: 'bg-gray-400',
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 space-y-8 admin-content-mobile">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="admin-header-mobile font-bold mb-2">Bảng Điều Khiển Quản Trị</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Quản lý sự kiện và theo dõi hoạt động
            </p>
          </div>

          {/* Mobile: Primary Action + Menu */}
          <div className="flex gap-2 lg:hidden">
            <Link href="/admin/events/create" className="flex-1">
              <Button className="gradient-1 hover-lift w-full admin-action-button" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Tạo Sự Kiện
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="admin-action-button">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Menu Quản Trị</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/themes" className="flex items-center cursor-pointer">
                    <Palette className="w-4 h-4 mr-2" />
                    Quản Lý Theme
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/analytics" className="flex items-center cursor-pointer">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Thống Kê
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/users" className="flex items-center cursor-pointer">
                    <UserCog className="w-4 h-4 mr-2" />
                    Quản Lý User
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/team" className="flex items-center cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    Quản Lý Team
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/posts" className="flex items-center cursor-pointer">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Quản Lý Nội Dung
                    {pendingPostsCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {pendingPostsCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop: All Buttons Visible */}
          <div className="hidden lg:flex gap-2 flex-wrap">
            <Link href="/admin/themes">
              <Button variant="outline" size="lg" className="admin-action-button">
                <Palette className="w-5 h-5 mr-2" />
                Quản Lý Theme
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" size="lg" className="admin-action-button">
                <BarChart3 className="w-5 h-5 mr-2" />
                Thống Kê
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" size="lg" className="admin-action-button">
                <UserCog className="w-5 h-5 mr-2" />
                Quản Lý User
              </Button>
            </Link>
            <Link href="/admin/team">
              <Button variant="outline" size="lg" className="admin-action-button">
                <Users className="w-5 h-5 mr-2" />
                Quản Lý Team
              </Button>
            </Link>
            <Link href="/admin/posts">
              <Button variant="outline" size="lg" className="relative admin-action-button">
                <FileCheck className="w-5 h-5 mr-2" />
                Quản Lý Nội Dung
                {pendingPostsCount && pendingPostsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {pendingPostsCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/events/create">
              <Button className="gradient-1 hover-lift hover-glow ripple admin-action-button" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Tạo Sự Kiện
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
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
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Events List */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tất Cả Sự Kiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!events || events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Chưa có sự kiện nào</h3>
                <p className="text-muted-foreground mb-6">
                  Tạo sự kiện đầu tiên để bắt đầu
                </p>
                <Link href="/admin/events/create">
                  <Button className="gradient-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Sự Kiện Đầu Tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.slug}/edit`}
                    className="block"
                  >
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-border hover-lift animate-slide-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          <span
                            className={`${statusColors[event.status]} text-white text-xs px-2 py-1 rounded-full capitalize`}
                          >
                            {event.status === 'draft' ? 'Nháp' :
                             event.status === 'open' ? 'Mở' :
                             event.status === 'closed' ? 'Đóng' :
                             'Lưu trữ'}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.event_date).toLocaleDateString('vi-VN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {event.stats?.total_photos || 0} ảnh
                          </span>
                          <span className="flex items-center gap-1">
                            <UsersTeam className="w-4 h-4" />
                            {event.stats?.total_contributors || 0} người
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <Button variant="outline" size="sm">
                        Chỉnh Sửa
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav pendingPostsCount={pendingPostsCount} />
    </main>
  )
}
