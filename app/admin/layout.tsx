import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { AdminLayout } from '@/components/admin/admin-layout'
import { getPendingPostsCount } from '@/lib/services/admin-stats-service'

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

  // Get pending posts count for badge in navigation
  let pendingPostsCount = 0
  try {
    pendingPostsCount = await getPendingPostsCount()
  } catch (error) {
    console.error('Error fetching pending posts count:', error)
  }

  return (
    <AdminLayout pendingPostsCount={pendingPostsCount}>
      {children}
    </AdminLayout>
  )
}
