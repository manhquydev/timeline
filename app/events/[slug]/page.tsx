import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { TimelineNav } from '@/components/timeline/timeline-nav'
import { EventPhotos } from '@/components/events/event-photos-enhanced'
import { UploadZone } from '@/components/upload/upload-zone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Image as ImageIcon, Users, Upload } from 'lucide-react'
import { formatDateRange } from '@/lib/date-utils'
import { pluralize } from '@/lib/string-utils'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'
import { enrichPostsWithDisplayNames } from '@/lib/supabase/profile-utils'
import type { Event } from '@/lib/types'

export const revalidate = 30 // Revalidate every 30 seconds

interface EventPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params

  // Fetch event from MongoDB
  const event = await eventRepository.findBySlug(slug)

  if (!event) {
    return {
      title: 'Không Tìm Thấy Sự Kiện',
    }
  }

  return {
    title: `${event.title} | Timeline Teky Hoàng Mai`,
    description: event.description || 'Xem ảnh và kỷ niệm từ sự kiện này',
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch event details from MongoDB
  const mongoEvent = await eventRepository.findBySlug(slug)

  if (!mongoEvent) {
    notFound()
  }

  // Convert MongoDB document to plain object
  const event = {
    id: mongoEvent.id,
    title: mongoEvent.title,
    description: mongoEvent.description || null,
    slug: mongoEvent.slug,
    event_date: mongoEvent.event_date,
    start_date: mongoEvent.start_date,
    end_date: mongoEvent.end_date || null,
    status: mongoEvent.status,
    allow_upload: mongoEvent.allow_upload,
    allow_wishes: mongoEvent.allow_wishes,
    cover_image_url: mongoEvent.cover_image_url || null,
    stats: mongoEvent.stats,
  }

  // Fetch all public events for navigation from MongoDB
  const mongoAllEvents = await eventRepository.findPublic()
  const allEvents = mongoAllEvents.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description || null,
    slug: e.slug,
    event_date: e.event_date.toISOString(),
    start_date: e.start_date.toISOString(),
    end_date: e.end_date?.toISOString() || null,
    status: e.status,
    allow_upload: e.allow_upload,
    allow_wishes: e.allow_wishes,
    cover_image_url: e.cover_image_url || null,
    total_photos: e.stats.total_photos,
    total_videos: e.stats.total_videos,
    total_contributors: e.stats.total_contributors,
    created_at: e.created_at.toISOString(),
    updated_at: e.updated_at.toISOString(),
  }))

  // Fetch approved posts for this event from MongoDB
  const mongoPosts = await postRepository.findApprovedByEvent(event.id)
  const postsWithStoredNames = mongoPosts.map(p => ({
    id: p.id,
    event_id: p.event_id,
    user_id: p.user_id || null,
    media_type: p.media_type,
    media_url: p.media_url,
    thumbnail_url: p.thumbnail_url || null,
    blurhash: p.blurhash || null,
    dimensions: {
      width: p.dimensions?.width || null,
      height: p.dimensions?.height || null,
    },
    file_size: p.file_size || null,
    wish_text: p.wish_text || null,
    uploaded_at: p.uploaded_at.toISOString(),
    view_count: p.view_count,
    status: p.status,
    user_name: p.user_name || null,
  }))

  // Enrich posts with real-time display names from user_profiles
  // This ensures that if users update their display_name, it reflects immediately
  const posts = await enrichPostsWithDisplayNames(postsWithStoredNames)

  const { data: { user } } = await supabase.auth.getUser()

  const statusColors = {
    draft: 'bg-gray-500',
    open: 'bg-green-500',
    closed: 'bg-blue-500',
    archived: 'bg-gray-400',
  }

  const canUpload = event.status === 'open' && event.allow_upload && user

  return (
    <>
      {allEvents && <TimelineNav events={allEvents} />}

      <main className="min-h-screen">
        {/* Event Header */}
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-6 md:py-8">
            {/* Cover Image */}
            {event.cover_image_url && (
              <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-lg overflow-hidden mb-6">
                <Image
                  src={event.cover_image_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Event Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl md:text-4xl font-bold">
                    {event.title}
                  </h1>
                  <Badge className={`${statusColors[event.status]} text-white capitalize`}>
                    {event.status === 'draft' ? 'Nháp' :
                     event.status === 'open' ? 'Mở' :
                     event.status === 'closed' ? 'Đóng' :
                     'Lưu trữ'}
                  </Badge>
                </div>

                {event.description && (
                  <p className="text-muted-foreground mb-4 max-w-3xl">
                    {event.description}
                  </p>
                )}

                {/* Event Meta */}
                <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateRange(event.start_date, event.end_date)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{event.stats?.total_photos || 0} ảnh</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.stats?.total_contributors || 0} người</span>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              {canUpload && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="hidden md:flex">
                      <Upload className="h-4 w-4 mr-2" />
                      Tải Ảnh Lên
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tải Ảnh Lên {event.title}</DialogTitle>
                      <DialogDescription>
                        Chia sẻ kỷ niệm của bạn từ sự kiện này
                      </DialogDescription>
                    </DialogHeader>
                    <UploadZone eventId={event.id} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="container mx-auto px-4 py-8">
          {!posts || posts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Chưa có ảnh nào</CardTitle>
                <CardDescription>
                  {canUpload
                    ? 'Hãy là người đầu tiên chia sẻ ảnh từ sự kiện này'
                    : 'Quay lại sau để xem ảnh từ sự kiện này'}
                </CardDescription>
              </CardHeader>
              {canUpload && (
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Tải Ảnh Đầu Tiên
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tải Ảnh Lên {event.title}</DialogTitle>
                        <DialogDescription>
                          Chia sẻ kỷ niệm của bạn từ sự kiện này
                        </DialogDescription>
                      </DialogHeader>
                      <UploadZone eventId={event.id} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              )}
            </Card>
          ) : (
            <EventPhotos initialPosts={posts} />
          )}
        </div>

        {/* Mobile Upload FAB */}
        {canUpload && posts && posts.length > 0 && (
          <div className="fixed bottom-6 right-6 md:hidden z-50">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
                  <Upload className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tải Ảnh Lên</DialogTitle>
                  <DialogDescription>
                    Chia sẻ kỷ niệm của bạn từ sự kiện này
                  </DialogDescription>
                </DialogHeader>
                <UploadZone eventId={event.id} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
    </>
  )
}
