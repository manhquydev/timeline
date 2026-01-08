'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Upload, LayoutDashboard, User, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  user?: {
    id: string
    email?: string
  } | null
  isAdmin?: boolean
  isModerator?: boolean
}

export function MobileBottomNav({ user, isAdmin, isModerator }: MobileBottomNavProps) {
  const pathname = usePathname()

  // Don't show on login page
  if (pathname === '/login') {
    return null
  }

  // Base navigation for all users
  const baseNavItems = [
    { href: '/', label: 'Timeline', icon: Home, requireAuth: false },
  ]

  // Authenticated user items
  const authNavItems = user ? [
    { href: '/upload', label: 'Tải Ảnh', icon: Upload, requireAuth: true },
    ...(isModerator && !isAdmin ? [{ href: '/moderator', label: 'Kiểm Duyệt', icon: ShieldCheck, requireAuth: true }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Quản Trị', icon: LayoutDashboard, requireAuth: true }] : []),
    { href: '/profile/settings', label: 'Cá Nhân', icon: User, requireAuth: true },
  ] : []

  const navItems = [...baseNavItems, ...authNavItems]

  // Don't show if only 1 item (just home)
  if (navItems.length === 1) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom glass border-t-0 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className={cn(
        "grid h-16 mx-auto max-w-screen-sm",
        navItems.length === 2 && "grid-cols-2",
        navItems.length === 3 && "grid-cols-3",
        navItems.length === 4 && "grid-cols-4",
        navItems.length === 5 && "grid-cols-5",
      )}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "touch-target-sm flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 gradient-1 rounded-b-full" />
              )}

              {/* Icon with scale animation */}
              <div className={cn(
                "transition-transform duration-300",
                isActive && "scale-110"
              )}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* Label */}
              <span className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive ? "opacity-100 scale-100" : "opacity-70 scale-95"
              )}>
                {item.label}
              </span>

              {/* Ripple effect on tap */}
              <span className="absolute inset-0 rounded-lg bg-primary/10 scale-0 group-active:scale-100 transition-transform duration-200" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
