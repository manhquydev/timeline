import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettingsForm } from '@/components/profile/profile-settings-form'

export const metadata = {
  title: 'Cài Đặt Hồ Sơ | Timeline Teky Hoàng Mai',
  description: 'Cập nhật thông tin cá nhân và biệt danh của bạn',
}

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cài Đặt Hồ Sơ</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và cách hiển thị tên của bạn trên ảnh
          </p>
        </div>

        <ProfileSettingsForm initialProfile={profile} userEmail={user.email || ''} />
      </div>
    </div>
  )
}
