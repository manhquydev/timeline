'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users as UsersIcon, FileCheck, BarChart3, MoreHorizontal,
  Palette, Settings, Workflow, Activity, UsersRound, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface AdminBottomNavProps {
  pendingPostsCount?: number
}

export function AdminBottomNav({ pendingPostsCount = 0 }: AdminBottomNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const mainNavItems = [
    { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, match: (p: string) => p === '/admin' },
    { href: '/admin/posts', label: 'Nội dung', icon: FileCheck, badge: pendingPostsCount, match: (p: string) => p.startsWith('/admin/posts') },
    { href: '/admin/users', label: 'Người dùng', icon: UsersIcon, match: (p: string) => p.startsWith('/admin/users') },
    { href: '/admin/analytics', label: 'Thống kê', icon: BarChart3, match: (p: string) => p.startsWith('/admin/analytics') },
  ]

  const moreNavItems = [
    { href: '/admin/team', label: 'Đội ngũ', icon: UsersRound, match: (p: string) => p.startsWith('/admin/team') },
    { href: '/admin/events/create', label: 'Tạo sự kiện', icon: Plus, match: (p: string) => p === '/admin/events/create' },
    { href: '/admin/themes', label: 'Giao diện', icon: Palette, match: (p: string) => p.startsWith('/admin/themes') },
    { href: '/admin/activities', label: 'Lịch sử', icon: Activity, match: (p: string) => p.startsWith('/admin/activities') },
    { href: '/admin/workflows', label: 'Luồng xử lý', icon: Workflow, match: (p: string) => p.startsWith('/admin/workflows') },
    { href: '/admin/settings', label: 'Cài đặt', icon: Settings, match: (p: string) => p.startsWith('/admin/settings') },
  ]

  const isMoreActive = moreNavItems.some(item => item.match(pathname))

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 safe-bottom">
        <div className="grid grid-cols-5 h-16">
          {mainNavItems.map(item => {
            const Icon = item.icon
            const isActive = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors relative',
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-500 rounded-t-full" />}
              </Link>
            )
          })}

          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-colors relative',
              isMoreActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={isMoreActive ? 2 : 1.5} />
            <span className="text-[10px] font-medium leading-none">Thêm</span>
            {isMoreActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-500 rounded-t-full" />}
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl bg-slate-900 border-slate-800">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left text-white">Tùy chọn khác</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 pb-6">
            {moreNavItems.map(item => {
              const Icon = item.icon
              const isActive = item.match(pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl transition-colors',
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
