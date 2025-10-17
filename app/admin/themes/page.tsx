import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { ThemeManagement } from '@/components/admin/theme-management'

export const metadata = {
  title: 'Quản Lý Theme | Admin',
  description: 'Quản lý theme cho toàn bộ hệ thống',
}

export default async function AdminThemesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản Lý Theme</h1>
        <p className="text-muted-foreground">
          Tùy chỉnh giao diện hệ thống theo từng sự kiện và dịp đặc biệt
        </p>
      </div>

      <ThemeManagement />
    </div>
  )
}
