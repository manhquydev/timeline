'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileCheck,
  BarChart3,
  Palette,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  Workflow,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

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
}

const COLLAPSE_KEY = 'admin-sidebar-collapsed'

export function AdminSidebar({ pendingPostsCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Load collapse state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY)
    if (stored !== null) {
      setCollapsed(stored === 'true')
    }
  }, [])

  // Save collapse state
  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem(COLLAPSE_KEY, String(newState))
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Tổng Quan',
      items: [
        {
          href: '/admin',
          label: 'Dashboard',
          icon: LayoutDashboard,
          match: (path) => path === '/admin',
        },
        {
          href: '/admin/analytics',
          label: 'Thống Kê',
          icon: BarChart3,
          match: (path) => path.startsWith('/admin/analytics'),
        },
      ],
    },
    {
      title: 'Quản Lý',
      items: [
        {
          href: '/admin/posts',
          label: 'Nội Dung',
          icon: FileCheck,
          badge: pendingPostsCount,
          match: (path) => path.startsWith('/admin/posts'),
        },
        {
          href: '/admin/users',
          label: 'Người Dùng',
          icon: Users,
          match: (path) => path.startsWith('/admin/users'),
        },
        {
          href: '/admin/team',
          label: 'Đội Ngũ',
          icon: UsersRound,
          match: (path) => path.startsWith('/admin/team'),
        },
      ],
    },
    {
      title: 'Sự Kiện',
      items: [
        {
          href: '/admin/events/create',
          label: 'Tạo Sự Kiện',
          icon: Plus,
          match: (path) => path === '/admin/events/create',
        },
        {
          href: '/admin/themes',
          label: 'Giao Diện',
          icon: Palette,
          match: (path) => path.startsWith('/admin/themes'),
        },
      ],
    },
    {
      title: 'Hệ Thống',
      items: [
        {
          href: '/admin/workflows',
          label: 'Workflows',
          icon: Workflow,
          match: (path) => path.startsWith('/admin/workflows'),
        },
        {
          href: '/admin/settings',
          label: 'Cài Đặt',
          icon: Settings,
          match: (path) => path.startsWith('/admin/settings'),
        },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-border/50 z-40 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-1 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Admin Panel</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.match(pathname)

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative',
                          isActive
                            ? 'bg-primary/10 text-primary border-l-2 border-primary'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                          collapsed && 'justify-center px-0'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon
                          className={cn(
                            'w-5 h-5 flex-shrink-0',
                            isActive && 'text-primary'
                          )}
                        />
                        {!collapsed && (
                          <span className="text-sm font-medium truncate">
                            {item.label}
                          </span>
                        )}
                        {item.badge && item.badge > 0 && (
                          <span
                            className={cn(
                              'bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center',
                              collapsed
                                ? 'absolute -top-1 -right-1 w-4 h-4'
                                : 'ml-auto w-5 h-5'
                            )}
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              {!collapsed && <Separator className="mt-4" />}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        {!collapsed ? (
          <div className="text-xs text-muted-foreground text-center">
            Timeline Admin v2.0
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-green-500 mx-auto" title="Online" />
        )}
      </div>
    </aside>
  )
}
