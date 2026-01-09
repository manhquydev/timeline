'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, UserCog, FileCheck, BarChart3 } from 'lucide-react'

const actions = [
  { title: 'Tạo Sự Kiện', desc: 'Thêm sự kiện mới', href: '/admin/events/create', icon: Plus, gradient: 'from-purple-500 to-indigo-600' },
  { title: 'Quản Lý User', desc: 'Phân quyền người dùng', href: '/admin/users', icon: UserCog, gradient: 'from-blue-500 to-cyan-500' },
  { title: 'Duyệt Nội Dung', desc: 'Xét duyệt bài đăng', href: '/admin/posts', icon: FileCheck, gradient: 'from-emerald-500 to-teal-500' },
  { title: 'Xem Thống Kê', desc: 'Báo cáo chi tiết', href: '/admin/analytics', icon: BarChart3, gradient: 'from-orange-500 to-amber-500' },
]

interface QuickActionsGridProps { pendingPostsCount?: number }

export function QuickActionsGrid({ pendingPostsCount }: QuickActionsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {actions.map((action, i) => {
        const Icon = action.icon
        const badge = action.href === '/admin/posts' && pendingPostsCount ? pendingPostsCount : null
        return (
          <motion.div key={action.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }}>
            <Link href={action.href} className="block group">
              <div className="relative p-4 md:p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg
                hover:shadow-[0_12px_40px_hsl(270_50%_20%/0.15)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">{action.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{action.desc}</p>
                  {badge && badge > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center animate-pulse">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
