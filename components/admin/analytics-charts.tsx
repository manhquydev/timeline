'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, PieChart, TrendingUp, Users } from 'lucide-react'

interface AnalyticsChartsProps {
  postsOverTime: Record<string, number>
  eventsByStatus: {
    draft: number
    open: number
    closed: number
    archived: number
  }
  postsByStatus: {
    pending: number
    approved: number
    rejected: number
  }
  topContributors: Array<{
    name: string
    uploads: number
  }>
  deviceBreakdown: Array<{
    label: string
    value: number
    color: string
  }>
  topPages: Array<{
    page: string
    views: number
    uniqueUsersCount: number
  }>
  uploadFunnel: Array<{
    step: string
    count: number
    uniqueUsersCount: number
    dropOff: number
    conversionRate: string
  }>
}

export function AnalyticsCharts({
  postsOverTime,
  eventsByStatus,
  postsByStatus,
  topContributors,
  deviceBreakdown,
  topPages,
  uploadFunnel,
}: AnalyticsChartsProps) {
  // Get recent dates (last 14 days)
  const recentDates = Object.entries(postsOverTime).slice(-14)
  const maxValue = Math.max(...recentDates.map(([, value]) => value), 1)

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'page_view': return 'Xem Trang'
      case 'click_upload': return 'Click Tải Lên'
      case 'upload_success': return 'Thành Công'
      default: return step
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts Over Time - Bar Chart */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Bài Đăng Theo Thời Gian (14 ngày gần nhất)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDates.map(([date, count], index) => {
                const percentage = (count / maxValue) * 100

                return (
                  <div key={date} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{date}</span>
                      <span className="text-sm font-semibold">{count} posts</span>
                    </div>
                    <div className="w-full h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full gradient-1 transition-all duration-500 ease-out flex items-center justify-end px-3"
                        style={{
                          width: `${percentage}%`,
                          minWidth: count > 0 ? '3rem' : '0',
                        }}
                      >
                        <span className="text-white text-xs font-bold">{count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {recentDates.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu bài đăng</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown - Donut Chart Style */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Thiết Bị Truy Cập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceBreakdown.map((item, index) => {
                const total = deviceBreakdown.reduce((a, b) => a + b.value, 0)
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`w-4 h-4 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
              {deviceBreakdown.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu thiết bị</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events by Status - Pie Chart */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Sự Kiện Theo Trạng Thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Nháp', value: eventsByStatus.draft, color: 'bg-gray-500' },
                { label: 'Đang Mở', value: eventsByStatus.open, color: 'bg-green-500' },
                { label: 'Đã Đóng', value: eventsByStatus.closed, color: 'bg-blue-500' },
                { label: 'Lưu Trữ', value: eventsByStatus.archived, color: 'bg-gray-400' },
              ].map((item, index) => {
                const total = Object.values(eventsByStatus).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`w-4 h-4 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Posts by Status */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Bài Đăng Theo Trạng Thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Chờ Duyệt', value: postsByStatus.pending, color: 'bg-yellow-500' },
                { label: 'Đã Duyệt', value: postsByStatus.approved, color: 'bg-green-500' },
                { label: 'Từ Chối', value: postsByStatus.rejected, color: 'bg-red-500' },
              ].map((item, index) => {
                const total = Object.values(postsByStatus).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`w-4 h-4 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Phễu Chuyển Đổi Tải Lên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {uploadFunnel.map((step, index) => {
                const total = uploadFunnel[0]?.uniqueUsersCount || 1
                const percentage = (step.uniqueUsersCount / total) * 100
                const isLast = index === uploadFunnel.length - 1

                return (
                  <div key={index} className="relative">
                    <div
                      className="flex items-center gap-4 animate-slide-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold z-10">
                          {index + 1}
                        </div>
                        {!isLast && (
                          <div className="w-0.5 h-12 bg-blue-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{getStepLabel(step.step)}</span>
                          <span className="text-sm text-muted-foreground">
                            {step.uniqueUsersCount} users ({step.conversionRate}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        {index > 0 && (
                          <p className="text-[10px] text-red-400 mt-1">
                            Giảm: {step.dropOff} người dùng
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top 10 Người Đóng Góp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topContributors.slice(0, 10).map((contributor, index) => {
                const maxUploads = topContributors[0]?.uploads || 1
                const percentage = (contributor.uploads / maxUploads) * 100

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 animate-slide-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contributor.name}</p>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full gradient-3 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {contributor.uploads}
                    </span>
                  </div>
                )
              })}
              {topContributors.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có người đóng góp nào
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Top Pages List */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Các Trang Phổ Biến
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-transparent hover:border-blue-500/30 transition-all">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium truncate">{page.page}</p>
                    <p className="text-xs text-muted-foreground">{page.uniqueUsersCount} người dùng duy nhất</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{page.views}</p>
                    <p className="text-xs text-muted-foreground">lượt xem</p>
                  </div>
                </div>
              ))}
              {topPages.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">Chưa có dữ liệu trang xem</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
