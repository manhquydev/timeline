'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Calendar, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditEventPage({ params }: PageProps) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const [eventId, setEventId] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    event_date: '',
    start_date: '',
    end_date: '',
    status: 'draft' as 'draft' | 'open' | 'closed' | 'archived',
    allow_upload: true,
    allow_wishes: true,
  })

  // Unwrap params and fetch event data
  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setOrigin(window.location.origin)

      // Fetch event data
      try {
        const response = await fetch(`/api/admin/events?slug=${resolvedParams.slug}`)
        if (!response.ok) throw new Error('Failed to fetch event')

        const data = await response.json()
        const event = data.event

        setEventId(event.id)
        setFormData({
          title: event.title,
          description: event.description || '',
          slug: event.slug,
          event_date: new Date(event.event_date).toISOString().split('T')[0],
          start_date: new Date(event.start_date).toISOString().slice(0, 16),
          end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
          status: event.status,
          allow_upload: event.allow_upload,
          allow_wishes: event.allow_wishes,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load event')
      } finally {
        setFetching(false)
      }
    }

    init()
  }, [params])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: eventId,
          ...formData,
          event_date: new Date(formData.event_date).toISOString(),
          start_date: new Date(formData.start_date).toISOString(),
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update event')
      }

      const data = await response.json()
      router.push(`/events/${data.event.slug}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete event')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete event')
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
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Bảng điều khiển
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Chỉnh Sửa Sự Kiện</h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin sự kiện
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Chi Tiết Sự Kiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Tên Sự Kiện *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Ngày Phụ Nữ 20/10, Team Building Q1"
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* Slug (auto-generated) */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-base font-semibold">
                  Đường Dẫn URL
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="tu-dong-tao-tu-ten"
                  className="h-12 text-base font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  URL sự kiện: {origin}/events/{formData.slug || 'slug'}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Mô Tả
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Chia sẻ về sự kiện này..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-base resize-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date" className="text-base font-semibold">
                    Ngày Sự Kiện *
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
                    Ngày Bắt Đầu *
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
                    Ngày Kết Thúc
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

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-semibold">
                  Trạng Thái *
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
                  <option value="open">Mở - Công khai & nhận ảnh</option>
                  <option value="closed">Đóng - Công khai nhưng không nhận ảnh</option>
                  <option value="archived">Lưu trữ - Ẩn khỏi công khai</option>
                </select>
              </div>

              {/* Permissions */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold">Quyền Truy Cập</h3>
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
                        Người dùng có thể tải ảnh lên sự kiện này
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
                        Người dùng có thể thêm lời nhắn kèm theo ảnh
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 animate-scale-in">
                  <p className="font-medium">Lỗi</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 text-base gradient-1 hover-lift hover-glow ripple font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-2 !w-4 !h-4 !border-2" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Lưu Thay Đổi
                    </>
                  )}
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
