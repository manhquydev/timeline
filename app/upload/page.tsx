import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Image as ImageIcon } from 'lucide-react'
import { eventRepository } from '@/lib/mongodb/repositories'
import { UploadPageClient } from './upload-page-client'
import { Card, CardContent } from '@/components/ui/card'
import type { UploadEvent } from '@/components/upload/types'

export const metadata = {
  title: 'Tải Ảnh | Timeline Teky Hoàng Mai',
  description: 'Chia sẻ ảnh của bạn từ các sự kiện Teky Hoàng Mai',
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

  // Convert to UploadEvent type for client components
  const events: UploadEvent[] = openEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description || null,
    slug: event.slug,
    cover_image_url: event.cover_image_url || null,
    total_photos: event.stats.total_photos,
    total_videos: event.stats.total_videos,
    status: event.status as 'open' | 'closed' | 'draft',
    allow_upload: event.allow_upload,
  }))

  // No events available
  if (!events || events.length === 0) {
    return (
      <main className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="border-0 shadow-xl max-w-md w-full">
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
      </main>
    )
  }

  // Render client component with bottom sheet auto-open
  return <UploadPageClient events={events} />
}
