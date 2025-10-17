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
}

export function AnalyticsCharts({
  postsOverTime,
  eventsByStatus,
  postsByStatus,
  topContributors,
}: AnalyticsChartsProps) {
  // Get recent dates (last 14 days)
  const recentDates = Object.entries(postsOverTime).slice(-14)
  const maxValue = Math.max(...recentDates.map(([, value]) => value), 1)

  return (
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
  )
}
