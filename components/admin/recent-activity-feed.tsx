'use client'

import { motion } from 'framer-motion'
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

const config: Record<Activity['type'], { icon: LucideIcon; color: string; bg: string }> = {
  new_post: { icon: Image, color: 'text-blue-600', bg: 'bg-blue-100' },
  user_signup: { icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100' },
  post_approved: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  post_rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  event_created: { icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
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
    <div className="text-center py-10 text-muted-foreground">
      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Chưa có hoạt động gần đây</p>
    </div>
  )

  return (
    <div className="relative">
      <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-200 via-blue-200 to-transparent" />
      <div className="space-y-3">
        {activities.slice(0, 6).map((a, i) => {
          const { icon: Icon, color, bg } = config[a.type]
          return (
            <motion.div key={a.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }} className="relative flex gap-3 pl-1">
              <div className={`relative z-10 w-6 h-6 rounded-full ${bg} flex items-center justify-center flex-shrink-0 ring-[3px] ring-white`}>
                <Icon className={`w-3 h-3 ${color}`} />
              </div>
              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {a.user?.name && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {a.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm text-foreground truncate">{a.message}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatTime(a.timestamp)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
