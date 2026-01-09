import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  // Temporarily simplified layout for debugging
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {children}
    </div>
  )
}
