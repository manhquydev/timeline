import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { AdminLayout } from '@/components/admin/admin-layout'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { Post } from '@/lib/mongodb/models'

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

  // Get pending posts count for badge
  let pendingPostsCount = 0
  try {
    await connectToDatabase()
    pendingPostsCount = await Post.countDocuments({ status: 'pending' })
  } catch (error) {
    console.error('Error fetching pending posts count:', error)
  }

  return (
    <AdminLayout pendingPostsCount={pendingPostsCount}>
      {children}
    </AdminLayout>
  )
}
