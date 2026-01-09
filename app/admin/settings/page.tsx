import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Globe, Upload, Bell, Database, Shield } from 'lucide-react'
import { SettingsForm } from './settings-form'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { getSettingsModel, DEFAULT_SETTINGS, type GlobalSettings } from '@/lib/mongodb/models'

export const metadata = {
  title: 'Cài Đặt Hệ Thống | Timeline Teky Hoàng Mai',
  description: 'Cấu hình và quản lý cài đặt hệ thống',
}

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  // Fetch settings from database (or use defaults)
  let settings: GlobalSettings = DEFAULT_SETTINGS

  try {
    await connectToDatabase()
    const SettingsModel = getSettingsModel()

    const dbSettings = await SettingsModel.findOne({ key: 'global' }).lean() as { value?: GlobalSettings } | null
    if (dbSettings?.value) {
      settings = { ...DEFAULT_SETTINGS, ...dbSettings.value }
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }

  const settingsSections = [
    {
      id: 'site',
      title: 'Thông Tin Website',
      description: 'Cấu hình tên, mô tả và chế độ bảo trì',
      icon: Globe,
    },
    {
      id: 'upload',
      title: 'Cài Đặt Upload',
      description: 'Giới hạn file, định dạng cho phép',
      icon: Upload,
    },
    {
      id: 'notifications',
      title: 'Thông Báo',
      description: 'Cấu hình email thông báo',
      icon: Bell,
    },
  ]

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 admin-content-mobile">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 md:w-8 md:h-8" />
            <h1 className="admin-header-mobile font-bold">Cài Đặt Hệ Thống</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Cấu hình và quản lý các thiết lập chung của hệ thống
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1 border-0 shadow-xl bg-white/60 backdrop-blur-xl h-fit">
            <CardHeader>
              <CardTitle className="text-base">Danh Mục</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </a>
                )
              })}

              {/* System Info */}
              <div className="pt-4 mt-4 border-t">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">MongoDB Atlas</p>
                    <p className="text-xs text-green-600">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mt-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Supabase Auth</p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Form */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Cấu Hình</CardTitle>
              <CardDescription>
                Thay đổi sẽ được áp dụng ngay lập tức sau khi lưu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm initialSettings={settings} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
