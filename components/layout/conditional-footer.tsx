'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './footer'

/**
 * Renders the public Footer only outside admin/moderator routes.
 * Admin area has its own dedicated navigation (AdminSidebar + AdminBottomNav).
 */
export function ConditionalFooter() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin') || pathname.startsWith('/moderator')) return null
  return <Footer />
}
