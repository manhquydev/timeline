'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Calendar, Save, Palette } from 'lucide-react'
import Link from 'next/link'

interface ThemeOption {
  id: string
  displayName: string
}

export default function CreateEventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const [themes, setThemes] = useState<ThemeOption[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    greeting_tag: '',
    event_date: '',
    start_date: '',
    end_date: '',
    status: 'draft' as 'draft' | 'open' | 'closed' | 'archived',
    allow_upload: true,
    allow_wishes: true,
    theme_id: '',
    activate_theme: false,
    enable_greeting_cards: false,
  })

  useEffect(() => {
    setOrigin(window.location.origin)

    const loadThemes = async () => {
      try {
        const response = await fetch('/api/admin/themes')
        if (!response.ok) return

        const payload = await response.json()
        const items = payload?.data?.themes || payload?.themes || []
        setThemes(items.map((t: any) => ({ id: t.id, displayName: t.displayName })))
      } catch {
        // Non-blocking
      }
    }

    void loadThemes()
  }, [])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    const generatedSlug = generateSlug(title)
    const shouldSyncGreetingTag = !formData.greeting_tag || formData.greeting_tag === formData.slug

    setFormData({
      ...formData,
      title,
      slug: generatedSlug,
      greeting_tag: shouldSyncGreetingTag ? generatedSlug : formData.greeting_tag,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.activate_theme && !formData.theme_id) {
      setError('Vui lòng chọn theme trước khi bật kích hoạt ngay.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          theme_id: formData.theme_id || null,
          greeting_tag: formData.greeting_tag || formData.slug,
          event_date: new Date(formData.event_date).toISOString(),
          start_date: new Date(formData.start_date).toISOString(),
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Không thể tạo sự kiện')
      }

      const event = payload?.data?.event ?? payload?.event
      if (!event?.slug) {
        throw new Error('Phản hồi từ máy chủ không hợp lệ')
      }

      router.push(`/events/${event.slug}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Không thể tạo sự kiện')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Bảng điều khiển
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Tạo Sự Kiện Mới</h1>
          <p className="text-muted-foreground">
            Thêm sự kiện mới vào dòng thời gian và cấu hình theme/thiệp ngay từ đầu.
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Chi Tiết Sự Kiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Tên Sự Kiện *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Quốc tế Phụ nữ 8/3"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-base font-semibold">
                  Đường dẫn URL
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="quoc-te-phu-nu-8-3"
                  className="h-12 text-base font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  URL sự kiện: {origin}/events/{formData.slug || 'slug'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Mô tả
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn về sự kiện..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-base resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date" className="text-base font-semibold">
                    Ngày sự kiện *
                  </Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-base font-semibold">
                    Bắt đầu *
                  </Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-base font-semibold">
                    Kết thúc
                  </Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-semibold">
                  Trạng thái *
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as typeof formData.status,
                    })
                  }
                  className="w-full h-12 px-3 rounded-md border border-input bg-background text-base"
                >
                  <option value="draft">Nháp - Chưa công khai</option>
                  <option value="open">Mở - Công khai và nhận ảnh</option>
                  <option value="closed">Đóng - Công khai nhưng không nhận ảnh</option>
                  <option value="archived">Lưu trữ - Ẩn khỏi công khai</option>
                </select>
              </div>

              <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold">Quyền truy cập</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_upload}
                      onChange={(e) =>
                        setFormData({ ...formData, allow_upload: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <div>
                      <p className="font-medium">Cho phép tải ảnh lên</p>
                      <p className="text-sm text-muted-foreground">
                        Người dùng có thể tải ảnh/video lên sự kiện này.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_wishes}
                      onChange={(e) =>
                        setFormData({ ...formData, allow_wishes: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <div>
                      <p className="font-medium">Cho phép thêm lời nhắn</p>
                      <p className="text-sm text-muted-foreground">
                        Người dùng có thể thêm lời chúc trong nội dung chia sẻ.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-lg border-2 border-primary/10 bg-primary/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Liên kết Theme và Thiệp chúc
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="theme_id">Theme sự kiện</Label>
                  <select
                    id="theme_id"
                    value={formData.theme_id}
                    onChange={(e) => setFormData({ ...formData, theme_id: e.target.value })}
                    className="w-full h-12 px-3 rounded-md border border-input bg-background text-base"
                  >
                    <option value="">Không dùng theme riêng</option>
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activate_theme}
                    onChange={(e) =>
                      setFormData({ ...formData, activate_theme: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium">Kích hoạt theme ngay khi tạo sự kiện</p>
                    <p className="text-sm text-muted-foreground">
                      Không cần thao tác thêm ở trang quản lý theme.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_greeting_cards}
                    onChange={(e) =>
                      setFormData({ ...formData, enable_greeting_cards: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium">Bật hiệu ứng thiệp rơi trên homepage</p>
                    <p className="text-sm text-muted-foreground">
                      Chỉ hiển thị ở trang chủ, các trang chức năng khác sẽ ẩn.
                    </p>
                  </div>
                </label>

                <div className="space-y-2">
                  <Label htmlFor="greeting_tag">Mã thiệp chúc theo sự kiện</Label>
                  <Input
                    id="greeting_tag"
                    value={formData.greeting_tag}
                    onChange={(e) => setFormData({ ...formData, greeting_tag: e.target.value })}
                    placeholder="8-3-2026"
                    className="h-12 text-base font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dùng để nhóm dữ liệu lời chúc cho sự kiện này (mặc định theo slug).
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 animate-scale-in">
                  <p className="font-medium">Lỗi</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 text-base gradient-1 hover-lift hover-glow ripple font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-2 !w-4 !h-4 !border-2" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Tạo sự kiện
                    </>
                  )}
                </Button>
                <Link href="/admin">
                  <Button type="button" variant="outline" className="h-12 px-6">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
