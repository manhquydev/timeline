'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileCheck,
  BarChart3,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  Workflow,
  Plus,
  Activity,
  ExternalLink,
  Mail,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
  match: (path: string) => boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

interface AdminSidebarProps {
  pendingPostsCount?: number
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ pendingPostsCount = 0, collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  const navGroups: NavGroup[] = [
    {
      title: 'Tổng quan',
      items: [
        { href: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard, match: (p) => p === '/admin' },
        { href: '/admin/analytics', label: 'Thống kê', icon: BarChart3, match: (p) => p.startsWith('/admin/analytics') },
      ],
    },
    {
      title: 'Quản lý',
      items: [
        { href: '/admin/posts', label: 'Nội dung', icon: FileCheck, badge: pendingPostsCount, match: (p) => p.startsWith('/admin/posts') },
        { href: '/admin/greetings', label: 'Thiệp', icon: Mail, match: (p) => p.startsWith('/admin/greetings') },
        { href: '/admin/users', label: 'Người dùng', icon: Users, match: (p) => p.startsWith('/admin/users') },
        { href: '/admin/team', label: 'Đội ngũ', icon: UsersRound, match: (p) => p.startsWith('/admin/team') },
      ],
    },
    {
      title: 'Cấu hình',
      items: [
        { href: '/admin/events/create', label: 'Tạo sự kiện', icon: Plus, match: (p) => p === '/admin/events/create' },
        { href: '/admin/themes', label: 'Giao diện', icon: Palette, match: (p) => p.startsWith('/admin/themes') },
        { href: '/admin/workflows', label: 'Luồng xử lý', icon: Workflow, match: (p) => p.startsWith('/admin/workflows') },
        { href: '/admin/activities', label: 'Lịch sử', icon: Activity, match: (p) => p.startsWith('/admin/activities') },
        { href: '/admin/settings', label: 'Cài đặt', icon: Settings, match: (p) => p.startsWith('/admin/settings') },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-40 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div
        className={cn(
          'h-14 flex items-center border-b border-slate-800 flex-shrink-0',
          collapsed ? 'justify-center' : 'gap-3 px-4'
        )}
      >
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="text-sm font-semibold text-white truncate">Admin Panel</span>}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navGroups.map((group, gi) => (
          <div key={group.title}>
            {!collapsed ? (
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                {group.title}
              </p>
            ) : (
              gi > 0 && <div className="border-t border-slate-800 mb-2" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.match(pathname)
                const badge = item.badge && item.badge > 0 ? item.badge : null

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
                        collapsed && 'justify-center px-0'
                      )}
                    >
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                      )}
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {badge && !collapsed && (
                        <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                      {badge && collapsed && (
                        <span className="absolute top-0.5 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-2 space-y-0.5 flex-shrink-0">
        <Link
          href="/"
          title={collapsed ? 'Về trang chủ' : undefined}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Về trang chủ</span>}
        </Link>
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
