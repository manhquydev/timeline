'use client'

import { ReactNode, useState, useEffect } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminBottomNav } from './admin-bottom-nav'
import { cn } from '@/lib/utils'

const COLLAPSE_KEY = 'admin-sidebar-collapsed'

interface AdminLayoutProps {
  children: ReactNode
  pendingPostsCount?: number
}

export function AdminLayout({ children, pendingPostsCount = 0 }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY)
    if (stored !== null) setCollapsed(stored === 'true')
  }, [])

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        pendingPostsCount={pendingPostsCount}
        collapsed={collapsed}
        onToggle={toggle}
      />
      <div className={cn(
        'min-h-screen transition-all duration-300',
        collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
      )}>
        {children}
      </div>
      <AdminBottomNav pendingPostsCount={pendingPostsCount} />
    </div>
  )
}
