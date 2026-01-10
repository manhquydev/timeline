import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

/**
 * Development Route Group Layout
 * Protects all routes under (dev) - admin-only access in production
 */
export default async function DevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In production, require admin access
  if (process.env.NODE_ENV === 'production') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
      redirect('/')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Development warning banner */}
      <div className="bg-amber-500 text-amber-950 text-center py-2 px-4 text-sm font-medium">
        ⚠️ Development/Debug Route - Admin Only
      </div>
      {children}
    </div>
  )
}
