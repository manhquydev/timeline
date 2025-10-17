import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UploadZone } from '@/components/upload/upload-zone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload as UploadIcon, Image as ImageIcon } from 'lucide-react'
import { eventRepository } from '@/lib/mongodb/repositories'

export const metadata = {
  title: 'Tải Ảnh | Dòng Thời Gian Kỷ Niệm',
  description: 'Chia sẻ ảnh của bạn từ các sự kiện công ty',
}

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Require authentication
  if (!user) {
    redirect('/login')
  }

  // Fetch open events that allow uploads from MongoDB
  const mongoEvents = await eventRepository.findByStatus('open')
  const openEvents = mongoEvents.filter(event => event.allow_upload)

  // Convert to plain objects for client components
  const events = openEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description || null,
    slug: event.slug,
    event_date: event.event_date.toISOString(),
    start_date: event.start_date.toISOString(),
    end_date: event.end_date?.toISOString() || null,
    status: event.status,
    allow_upload: event.allow_upload,
    allow_wishes: event.allow_wishes,
    cover_image_url: event.cover_image_url || null,
    total_photos: event.stats.total_photos,
    total_videos: event.stats.total_videos,
    total_contributors: event.stats.total_contributors,
    created_at: event.created_at.toISOString(),
    updated_at: event.updated_at.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl gradient-1 animate-scale-in">
            <UploadIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Tải Ảnh Lên</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Chia sẻ những khoảnh khắc đẹp từ các sự kiện công ty
          </p>
        </div>

        {/* Events Selection & Upload */}
        {!events || events.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Chưa có sự kiện nào đang mở
              </h3>
              <p className="text-muted-foreground">
                Hiện tại không có sự kiện nào đang nhận ảnh. Vui lòng quay lại sau.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Instructions */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Hướng Dẫn</CardTitle>
                <CardDescription>
                  Làm theo các bước sau để tải ảnh lên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                  <li>Chọn sự kiện bạn muốn tải ảnh lên</li>
                  <li>Kéo & thả ảnh vào khung hoặc click để chọn từ máy tính</li>
                  <li>Thêm lời nhắn (tùy chọn) để chia sẻ cảm nghĩ của bạn</li>
                  <li>Nhấn nút &quot;Tải Lên&quot; và đợi quá trình hoàn tất</li>
                </ol>
              </CardContent>
            </Card>

            {/* Upload Form for each event */}
            {events.map((event, index) => (
              <Card
                key={event.id}
                className="border-0 shadow-xl animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                      <CardDescription className="text-base">
                        {event.description || 'Tải ảnh lên sự kiện này'}
                      </CardDescription>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span>{event.total_photos} ảnh đã được tải lên</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <UploadZone
                    eventId={event.id}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
