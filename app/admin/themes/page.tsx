import { ThemeManagement } from '@/components/admin/theme-management'

export const metadata = {
  title: 'Quản Lý Theme | Timeline Teky Hoàng Mai',
  description: 'Quản lý theme cho toàn bộ hệ thống',
}

export default async function AdminThemesPage() {
  // Auth check handled in layout.tsx

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 admin-content-mobile">
        <div className="mb-8">
          <h1 className="admin-header-mobile font-bold mb-2">Quản Lý Theme</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Tùy chỉnh giao diện hệ thống theo từng sự kiện và dịp đặc biệt
          </p>
        </div>

        <ThemeManagement />
      </div>
    </main>
  )
}
