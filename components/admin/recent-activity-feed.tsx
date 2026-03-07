'use client'

import { Image, UserPlus, CheckCircle, XCircle, Calendar } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Activity {
  id: string
  type: 'new_post' | 'user_signup' | 'post_approved' | 'post_rejected' | 'event_created'
  message: string
  user?: { name: string; avatar?: string }
  timestamp: Date | string
}

interface RecentActivityFeedProps { activities: Activity[] }

const config: Record<Activity['type'], { icon: LucideIcon }> = {
  new_post: { icon: Image },
  user_signup: { icon: UserPlus },
  post_approved: { icon: CheckCircle },
  post_rejected: { icon: XCircle },
  event_created: { icon: Calendar },
}

function formatTime(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  if (hrs < 24) return `${hrs} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return new Date(date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (!activities.length) return (
    <div className="text-center py-10 text-slate-400">
      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p className="text-sm">Chưa có hoạt động gần đây</p>
    </div>
  )

  return (
    <div className="space-y-1">
      {activities.slice(0, 6).map((a) => {
        const { icon: Icon } = config[a.type]
        return (
          <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
            <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <p className="text-sm text-slate-700 flex-1 truncate">{a.message}</p>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatTime(a.timestamp)}</span>
          </div>
        )
      })}
    </div>
  )
}
