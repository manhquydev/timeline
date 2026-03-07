'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Palette, Save, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

interface EditEventFormProps {
  slug: string
}

interface ThemeOption {
  id: string
  displayName: string
}

export default function EditEventForm({ slug }: EditEventFormProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const [eventId, setEventId] = useState('')
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
    enable_greeting_cards: false,
    activate_theme: false,
    branding: {
      logo_url: '',
      banner_url: '',
      primary_color: '',
      custom_domain: '',
    },
    theme_id: '',
  })

  const getDeleteErrorMessage = (status: number, payload: any) => {
    const rawError = payload?.error || payload?.message || ''

    if (status === 401 || status === 403) {
      return 'Bạn không có quyền xóa sự kiện này. Vui lòng đăng nhập lại bằng tài khoản quản trị.'
    }
    if (status === 404) {
      return 'Không tìm thấy sự kiện. Có thể sự kiện đã bị xóa trước đó.'
    }
    if (status === 400 && /id is required/i.test(rawError)) {
      return 'Không thể xóa vì thiếu mã sự kiện. Vui lòng tải lại trang và thử lại.'
    }
    if (rawError) {
      return `Xóa sự kiện chưa thành công: ${rawError}`
    }

    return 'Xóa sự kiện chưa thành công. Vui lòng thử lại sau ít phút.'
  }

  useEffect(() => {
    const init = async () => {
      setOrigin(window.location.origin)

      try {
        const themesRes = await fetch('/api/admin/themes')
        if (themesRes.ok) {
          const themesPayload = await themesRes.json()
          const list = themesPayload?.data?.themes || themesPayload?.themes || []
          setThemes(list.map((t: any) => ({ id: t.id, displayName: t.displayName })))
        }

        const response = await fetch(`/api/admin/events?slug=${slug}`)
        if (!response.ok) throw new Error('Không thể tải dữ liệu sự kiện')

        const payload = await response.json()
        const event = payload?.data?.event ?? payload?.event
        if (!event) throw new Error('Phản hồi sự kiện không hợp lệ')

        setEventId(event.id)
        setFormData({
          title: event.title,
          description: event.description || '',
          slug: event.slug,
          greeting_tag: event.greeting_tag || event.slug,
          event_date: new Date(event.event_date).toISOString().split('T')[0],
          start_date: new Date(event.start_date).toISOString().slice(0, 16),
          end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
          status: event.status,
          allow_upload: event.allow_upload,
          allow_wishes: event.allow_wishes,
          enable_greeting_cards: event.enable_greeting_cards === true,
          activate_theme: false,
          branding: {
            logo_url: event.branding?.logo_url || '',
            banner_url: event.branding?.banner_url || '',
            primary_color: event.branding?.primary_color || '',
            custom_domain: event.branding?.custom_domain || '',
          },
          theme_id: event.theme_id || '',
        })
      } catch (err: any) {
        setError(err.message || 'Không thể tải sự kiện')
      } finally {
        setFetching(false)
      }
    }

    void init()
  }, [slug])

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
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: eventId,
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
        throw new Error(payload.error || 'Không thể cập nhật sự kiện')
      }

      const event = payload?.data?.event ?? payload?.event
      if (!event?.slug) {
        throw new Error('Phản hồi từ máy chủ không hợp lệ')
      }

      router.push(`/events/${event.slug}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật sự kiện')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(getDeleteErrorMessage(response.status, payload))
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Không thể xóa sự kiện')
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    )
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
          <h1 className="text-4xl font-bold mb-2">Chỉnh Sửa Sự Kiện</h1>
          <p className="text-muted-foreground">Cập nhật thông tin sự kiện và cấu hình liên kết theme/thiệp.</p>
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
                <Label htmlFor="title" className="text-base font-semibold">Tên sự kiện *</Label>
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
                <Label htmlFor="slug" className="text-base font-semibold">Đường dẫn URL</Label>
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
                <Label htmlFor="description" className="text-base font-semibold">Mô tả</Label>
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
                  <Label htmlFor="event_date" className="text-base font-semibold">Ngày sự kiện *</Label>
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
                  <Label htmlFor="start_date" className="text-base font-semibold">Bắt đầu *</Label>
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
                  <Label htmlFor="end_date" className="text-base font-semibold">Kết thúc</Label>
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
                <Label htmlFor="status" className="text-base font-semibold">Trạng thái *</Label>
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
                      onChange={(e) => setFormData({ ...formData, allow_upload: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <div>
                      <p className="font-medium">Cho phép tải ảnh lên</p>
                      <p className="text-sm text-muted-foreground">Người dùng có thể tải ảnh/video lên sự kiện này.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_wishes}
                      onChange={(e) => setFormData({ ...formData, allow_wishes: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <div>
                      <p className="font-medium">Cho phép thêm lời nhắn</p>
                      <p className="text-sm text-muted-foreground">Người dùng có thể thêm lời chúc trong nội dung chia sẻ.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-lg border-2 border-primary/10 bg-primary/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Thương hiệu, Theme và Thiệp chúc
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      value={formData.branding.logo_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, logo_url: e.target.value },
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Màu chủ đạo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-12 p-1"
                        value={formData.branding.primary_color || '#7c3aed'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            branding: { ...formData.branding, primary_color: e.target.value },
                          })
                        }
                      />
                      <Input
                        value={formData.branding.primary_color}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            branding: { ...formData.branding, primary_color: e.target.value },
                          })
                        }
                        placeholder="#hex"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme_id">Theme hệ thống</Label>
                  <select
                    id="theme_id"
                    value={formData.theme_id}
                    onChange={(e) => setFormData({ ...formData, theme_id: e.target.value })}
                    className="w-full h-12 px-3 rounded-md border border-input bg-background text-base"
                  >
                    <option value="">Sử dụng theme mặc định</option>
                    {themes.map((t) => (
                      <option key={t.id} value={t.id}>{t.displayName}</option>
                    ))}
                  </select>
                </div>

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
                    Dùng để gom lời chúc theo sự kiện (mặc định theo slug).
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_greeting_cards}
                    onChange={(e) => setFormData({ ...formData, enable_greeting_cards: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium">Bật hiệu ứng thiệp rơi trên homepage</p>
                    <p className="text-sm text-muted-foreground">
                      Chỉ hiển thị ở trang chủ, các trang chức năng khác sẽ ẩn để tránh click nhầm.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activate_theme}
                    onChange={(e) => setFormData({ ...formData, activate_theme: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium">Kích hoạt theme ngay khi lưu</p>
                    <p className="text-sm text-muted-foreground">
                      Đồng bộ event và theme trong cùng thao tác.
                    </p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  <p className="font-medium">Lỗi</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 text-base gradient-1 font-semibold"
                >
                  {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="h-12 px-6"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Xóa
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
