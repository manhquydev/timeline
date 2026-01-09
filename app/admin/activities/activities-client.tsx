'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Image, UserPlus, CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Activity {
  id: string
  type: 'new_post' | 'user_signup' | 'post_approved' | 'post_rejected' | 'event_created'
  message: string
  user?: { name: string }
  timestamp: string
  details?: Record<string, any>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const typeConfig: Record<Activity['type'], { icon: typeof Image; color: string; bg: string; label: string }> = {
  new_post: { icon: Image, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Tải ảnh' },
  user_signup: { icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Đăng ký' },
  post_approved: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Duyệt bài' },
  post_rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Từ chối' },
  event_created: { icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Tạo sự kiện' },
}

const filterOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'new_post', label: 'Tải ảnh mới' },
  { value: 'post_approved', label: 'Duyệt bài' },
  { value: 'post_rejected', label: 'Từ chối bài' },
  { value: 'event_created', label: 'Tạo sự kiện' },
  { value: 'user_signup', label: 'Đăng ký mới' },
]

function formatTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  if (hrs < 24) return `${hrs} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return new Date(date).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: days > 365 ? 'numeric' : undefined,
  })
}

export function ActivitiesClient() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (filter !== 'all') params.set('type', filter)

      const res = await fetch(`/api/admin/activities?${params}`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setPage(1) // Reset to first page when filter changes
  }

  if (loading && activities.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {filterOptions.find(f => f.value === filter)?.label || 'Lọc hoạt động'}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            {filterOptions.map(option => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={filter === option.value ? 'bg-purple-50 text-purple-700' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {pagination && (
          <span className="text-sm text-muted-foreground ml-auto">
            {pagination.total} hoạt động
          </span>
        )}
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có hoạt động nào</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-purple-200 via-blue-200 to-transparent" />
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Trang {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages || loading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const config = typeConfig[activity.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="relative flex gap-4 pl-2 py-3 hover:bg-white/50 rounded-xl transition-colors"
    >
      {/* Icon */}
      <div className={`relative z-10 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 ring-4 ring-white shadow-sm`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{activity.message}</p>
            {activity.user?.name && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold">
                  {activity.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground">{activity.user.name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(activity.timestamp)}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse pl-2">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  )
}
