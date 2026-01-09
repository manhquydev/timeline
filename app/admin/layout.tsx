import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { AdminLayout } from '@/components/admin/admin-layout'

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
  const Post = (await import('@/lib/mongodb/models')).Post
  await (await import('@/lib/mongodb/connection')).connectToDatabase()
  const pendingPostsCount = await Post.countDocuments({ status: 'pending' })

  return (
    <AdminLayout pendingPostsCount={pendingPostsCount}>
      {children}
    </AdminLayout>
  )
}
