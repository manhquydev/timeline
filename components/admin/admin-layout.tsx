'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminBottomNav } from './admin-bottom-nav'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: ReactNode
  pendingPostsCount?: number
}

export function AdminLayout({ children, pendingPostsCount = 0 }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Desktop Sidebar */}
      <AdminSidebar pendingPostsCount={pendingPostsCount} />

      {/* Main Content - offset for sidebar on desktop */}
      <div className={cn(
        'transition-all duration-300',
        'lg:ml-64' // Sidebar width on desktop
      )}>
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav pendingPostsCount={pendingPostsCount} />
    </div>
  )
}
