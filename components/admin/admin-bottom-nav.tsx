'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users as UsersIcon, FileCheck, BarChart3, Palette, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminBottomNavProps {
  pendingPostsCount?: number
}

export function AdminBottomNav({ pendingPostsCount = 0 }: AdminBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      match: (path: string) => path === '/admin'
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: UsersIcon,
      match: (path: string) => path.startsWith('/admin/users')
    },
    {
      href: '/admin/team',
      label: 'Team',
      icon: Users,
      match: (path: string) => path.startsWith('/admin/team')
    },
    {
      href: '/admin/posts',
      label: 'Posts',
      icon: FileCheck,
      badge: pendingPostsCount,
      match: (path: string) => path.startsWith('/admin/posts')
    },
    {
      href: '/admin/analytics',
      label: 'Stats',
      icon: BarChart3,
      match: (path: string) => path.startsWith('/admin/analytics')
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t shadow-lg dark:bg-background/90 dark:border-border/30 safe-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(item => {
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
      </div>
    </nav>
  )
}
