'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Upload, LayoutDashboard, User, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useNotificationStore, useModerationStore } from '@/lib/stores/notification-store'
import { useStoryModeStore } from '@/lib/stores/story-mode-store'
import { NavBadge } from '@/components/ui/nav-badge'

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
  const { unreadCount } = useNotificationStore()
  const { pendingCount } = useModerationStore()
  const { isStoryMode } = useStoryModeStore()

  // Don't show on login page or in story mode
  if (pathname === '/login' || isStoryMode) {
    return null
  }

  // Base navigation for all users
  const baseNavItems = [
    { href: '/', label: 'Timeline', icon: Home, requireAuth: false, badge: 0 },
  ]

  // Authenticated user items
  const authNavItems = user ? [
    { href: '/upload', label: 'Tải Ảnh', icon: Upload, requireAuth: true, badge: 0 },
    ...(isModerator && !isAdmin ? [{ href: '/moderator', label: 'Kiểm Duyệt', icon: ShieldCheck, requireAuth: true, badge: pendingCount }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Quản Trị', icon: LayoutDashboard, requireAuth: true, badge: pendingCount }] : []),
    { href: '/profile/settings', label: 'Cá Nhân', icon: User, requireAuth: true, badge: unreadCount },
  ] : []

  const navItems = [...baseNavItems, ...authNavItems]

  // Don't show if only 1 item (just home)
  if (navItems.length === 1) {
    return null
  }

  const handleNavClick = () => {
    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      {/* Enhanced glass background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl saturate-150 border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]" />

      <div className={cn(
        "relative grid h-16 mx-auto max-w-screen-sm",
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
              onClick={handleNavClick}
              className={cn(
                "touch-target-sm flex flex-col items-center justify-center gap-1 transition-all duration-200 relative group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active pill background */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-2 inset-y-1 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Active top indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-coral rounded-b-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon with scale animation */}
              <motion.div
                className="relative"
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                {/* Notification badge */}
                <NavBadge count={item.badge} />
              </motion.div>

              {/* Label */}
              <motion.span
                className="text-xs font-medium"
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 1 : 0.95,
                }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>

              {/* Ripple effect on tap */}
              <span className="absolute inset-0 rounded-lg bg-primary/10 scale-0 group-active:scale-100 transition-transform duration-200" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
