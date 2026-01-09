'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Globe, Upload, Bell } from 'lucide-react'

interface Settings {
  site: {
    name: string
    description: string
    maintenanceMode: boolean
  }
  upload: {
    maxFileSize: number
    allowedTypes: string[]
    autoApprove: boolean
    compressionQuality: number
  }
  notifications: {
    emailOnNewPost: boolean
    emailOnNewUser: boolean
    emailOnPendingReview: boolean
  }
}

interface SettingsFormProps {
  initialSettings: Settings
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast({
        title: 'Đã lưu cài đặt',
        description: 'Các thay đổi đã được áp dụng thành công.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt. Vui lòng thử lại.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSite = (key: keyof Settings['site'], value: any) => {
    setSettings((prev) => ({
      ...prev,
      site: { ...prev.site, [key]: value },
    }))
  }

  const updateUpload = (key: keyof Settings['upload'], value: any) => {
    setSettings((prev) => ({
      ...prev,
      upload: { ...prev.upload, [key]: value },
    }))
  }

  const updateNotifications = (key: keyof Settings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  return (
    <div className="space-y-8">
      {/* Site Settings */}
      <section id="site">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Thông Tin Website</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Tên Website</Label>
            <Input
              id="siteName"
              value={settings.site.name}
              onChange={(e) => updateSite('name', e.target.value)}
              placeholder="Timeline Teky Hoàng Mai"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Mô Tả</Label>
            <Input
              id="siteDescription"
              value={settings.site.description}
              onChange={(e) => updateSite('description', e.target.value)}
              placeholder="Lưu giữ kỷ niệm công ty..."
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200">
            <div>
              <Label htmlFor="maintenanceMode" className="text-orange-800">
                Chế Độ Bảo Trì
              </Label>
              <p className="text-sm text-orange-600">
                Khi bật, chỉ admin có thể truy cập website
              </p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.site.maintenanceMode}
              onCheckedChange={(checked) => updateSite('maintenanceMode', checked)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Upload Settings */}
      <section id="upload">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Cài Đặt Upload</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Kích Thước File Tối Đa: {settings.upload.maxFileSize}MB</Label>
            <Slider
              value={[settings.upload.maxFileSize]}
              onValueChange={(value) => updateUpload('maxFileSize', value[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Giới hạn từ 1MB đến 50MB
            </p>
          </div>

          <div className="space-y-2">
            <Label>Chất Lượng Nén: {settings.upload.compressionQuality}%</Label>
            <Slider
              value={[settings.upload.compressionQuality]}
              onValueChange={(value) => updateUpload('compressionQuality', value[0])}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Chất lượng cao hơn = file lớn hơn
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="autoApprove">Tự Động Duyệt</Label>
              <p className="text-sm text-muted-foreground">
                Bài đăng mới tự động được duyệt (không khuyến khích)
              </p>
            </div>
            <Switch
              id="autoApprove"
              checked={settings.upload.autoApprove}
              onCheckedChange={(checked) => updateUpload('autoApprove', checked)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Notification Settings */}
      <section id="notifications">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Thông Báo Email</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="emailNewPost">Bài Đăng Mới</Label>
              <p className="text-sm text-muted-foreground">
                Nhận email khi có bài đăng mới
              </p>
            </div>
            <Switch
              id="emailNewPost"
              checked={settings.notifications.emailOnNewPost}
              onCheckedChange={(checked) => updateNotifications('emailOnNewPost', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="emailNewUser">Người Dùng Mới</Label>
              <p className="text-sm text-muted-foreground">
                Nhận email khi có người dùng đăng ký
              </p>
            </div>
            <Switch
              id="emailNewUser"
              checked={settings.notifications.emailOnNewUser}
              onCheckedChange={(checked) => updateNotifications('emailOnNewUser', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="emailPending">Chờ Duyệt</Label>
              <p className="text-sm text-muted-foreground">
                Nhận email khi có bài đăng chờ duyệt
              </p>
            </div>
            <Switch
              id="emailPending"
              checked={settings.notifications.emailOnPendingReview}
              onCheckedChange={(checked) => updateNotifications('emailOnPendingReview', checked)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu Cài Đặt
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
