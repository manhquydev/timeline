'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users as UsersIcon, FileCheck, BarChart3, MoreHorizontal, Palette, Settings, Workflow, Activity, UsersRound, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface AdminBottomNavProps {
  pendingPostsCount?: number
}

export function AdminBottomNav({ pendingPostsCount = 0 }: AdminBottomNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const mainNavItems = [
    {
      href: '/admin',
      label: 'Home',
      icon: LayoutDashboard,
      match: (path: string) => path === '/admin'
    },
    {
      href: '/admin/posts',
      label: 'Posts',
      icon: FileCheck,
      badge: pendingPostsCount,
      match: (path: string) => path.startsWith('/admin/posts')
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: UsersIcon,
      match: (path: string) => path.startsWith('/admin/users')
    },
    {
      href: '/admin/analytics',
      label: 'Stats',
      icon: BarChart3,
      match: (path: string) => path.startsWith('/admin/analytics')
    },
  ]

  const moreNavItems = [
    {
      href: '/admin/team',
      label: 'Đội Ngũ',
      icon: UsersRound,
      match: (path: string) => path.startsWith('/admin/team')
    },
    {
      href: '/admin/events/create',
      label: 'Tạo Sự Kiện',
      icon: Plus,
      match: (path: string) => path === '/admin/events/create'
    },
    {
      href: '/admin/themes',
      label: 'Giao Diện',
      icon: Palette,
      match: (path: string) => path.startsWith('/admin/themes')
    },
    {
      href: '/admin/activities',
      label: 'Lịch Sử',
      icon: Activity,
      match: (path: string) => path.startsWith('/admin/activities')
    },
    {
      href: '/admin/workflows',
      label: 'Workflows',
      icon: Workflow,
      match: (path: string) => path.startsWith('/admin/workflows')
    },
    {
      href: '/admin/settings',
      label: 'Cài Đặt',
      icon: Settings,
      match: (path: string) => path.startsWith('/admin/settings')
    },
  ]

  // Check if any "more" item is active
  const isMoreActive = moreNavItems.some(item => item.match(pathname))

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t shadow-lg safe-bottom">
        <div className="grid grid-cols-5 h-16">
          {mainNavItems.map(item => {
            const Icon = item.icon
            const isActive = item.match(pathname)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all touch-manipulation relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform",
                      isActive && "scale-110"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 gradient-1 rounded-full" />
                )}
              </Link>
            )
          })}

          {/* More Button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all touch-manipulation relative",
              isMoreActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MoreHorizontal
              className={cn(
                "w-5 h-5 transition-transform",
                isMoreActive && "scale-110"
              )}
              strokeWidth={isMoreActive ? 2.5 : 2}
            />
            <span className={cn(
              "text-[10px] font-medium transition-all",
              isMoreActive && "font-semibold"
            )}>
              More
            </span>
            {isMoreActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 gradient-1 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">Thêm Tùy Chọn</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 pb-6">
            {moreNavItems.map(item => {
              const Icon = item.icon
              const isActive = item.match(pathname)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
