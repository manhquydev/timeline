import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TimelineNav } from '@/components/timeline/timeline-nav'
import { ThemeProvider } from '@/lib/themes/theme-provider'
import { EventPhotos } from '@/components/events/event-photos-enhanced'
import { EventStickyHeader } from '@/components/events/event-sticky-header'
import { EventHeroCover } from '@/components/events/event-hero-cover'
import { EventSocialBar } from '@/components/events/event-social-bar'
import { StickyUploadFab } from '@/components/events/sticky-upload-fab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Upload } from 'lucide-react'
import { UploadBottomSheet } from '@/components/upload/upload-bottom-sheet'
import type { UploadEvent } from '@/components/upload/types'
import { eventRepository, greetingRepository, postRepository } from '@/lib/mongodb/repositories'
import { enrichPostsWithDisplayNames } from '@/lib/supabase/profile-utils'
import { getEventSchema, getBreadcrumbSchema } from '@/lib/seo/structured-data'

export const revalidate = 30

interface EventPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ postId?: string; greetingId?: string }>
}

export async function generateMetadata({ params }: Pick<EventPageProps, 'params'>) {
  const { slug } = await params
  const event = await eventRepository.findBySlug(slug)

  if (!event) {
    return { title: 'Không Tìm Thấy Sự Kiện' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const eventUrl = `${baseUrl}/events/${event.slug}`
  const description = event.description || `Xem ảnh và kỷ niệm từ ${event.title} tại Teky Hoàng Mai`

  return {
    title: `${event.title} | Timeline Teky Hoàng Mai`,
    description,
    keywords: [event.title, 'Teky Hoàng Mai', 'sự kiện', 'ảnh sự kiện', 'kỷ niệm', 'timeline', 'gallery'],
    openGraph: {
      title: event.title,
      description,
      url: eventUrl,
      siteName: 'Timeline Teky Hoàng Mai',
      type: 'website',
      images: event.cover_image_url ? [{ url: event.cover_image_url, width: 1200, height: 630, alt: event.title }] : [],
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: event.cover_image_url ? [event.cover_image_url] : [],
    },
    alternates: { canonical: eventUrl },
  }
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params
  const { postId, greetingId } = await searchParams
  const supabase = await createClient()

  const mongoEvent = await eventRepository.findBySlug(slug)
  if (!mongoEvent) notFound()

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
    greeting_tag: mongoEvent.greeting_tag || mongoEvent.slug,
    cover_image_url: mongoEvent.cover_image_url || null,
    stats: mongoEvent.stats,
    branding: mongoEvent.branding || {},
    theme_id: mongoEvent.theme_id || null,
  }

  // Fetch custom theme if specified
  let customTheme = null
  if (event.theme_id) {
    try {
      const { themeRepository } = await import('@/lib/mongodb/repositories')
      customTheme = await themeRepository.findById(event.theme_id)
      if (customTheme) customTheme = JSON.parse(JSON.stringify(customTheme))
    } catch (err) {
      console.error('Failed to fetch custom theme:', err)
    }
  }

  // Fetch all public events for navigation
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

  // Fetch initial posts
  const { posts: mongoPosts, nextCursor } = await postRepository.findWithCursor(event.id, 20, undefined, 'approved')
  const postsWithStoredNames = mongoPosts.map(p => ({
    id: p.id,
    event_id: p.event_id,
    user_id: p.user_id || null,
    media_type: p.media_type,
    media_url: p.media_url,
    thumbnail_url: p.thumbnail_url || null,
    blurhash: p.blurhash || null,
    dimensions: { width: p.dimensions?.width || null, height: p.dimensions?.height || null },
    file_size: p.file_size || null,
    wish_text: p.wish_text || null,
    uploaded_at: p.uploaded_at.toISOString(),
    view_count: p.view_count,
    status: p.status,
    user_name: p.user_name || null,
    likes_count: p.likes_count || 0,
    comments_count: p.comments_count || 0,
  }))

  const posts = await enrichPostsWithDisplayNames(postsWithStoredNames)
  const { data: { user } } = await supabase.auth.getUser()

  let focusedGreeting: { id: string; message: string; authorName: string } | null = null
  if (typeof greetingId === 'string' && greetingId.trim().length > 0) {
    try {
      const greeting = await greetingRepository.findApprovedById(greetingId.trim())
      if (
        greeting &&
        (
          (greeting.eventId && greeting.eventId === event.id) ||
          greeting.eventTag === event.greeting_tag
        )
      ) {
        focusedGreeting = {
          id: greeting.id,
          message: greeting.message,
          authorName: greeting.authorName,
        }
      }
    } catch (err) {
      console.error('Failed to load focused greeting:', err)
    }
  }

  let userName = undefined
  let avatarUrl = undefined
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()
    userName = (profile as any)?.display_name
    avatarUrl = (profile as any)?.avatar_url
  }

  const canUpload = event.status === 'open' && event.allow_upload && !!user

  // SEO structured data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const eventUrl = `${baseUrl}/events/${event.slug}`
  const eventSchemaData = getEventSchema({
    name: event.title,
    description: event.description || undefined,
    startDate: new Date(event.start_date).toISOString(),
    endDate: event.end_date ? new Date(event.end_date).toISOString() : undefined,
    image: event.cover_image_url || undefined,
    url: eventUrl,
  })
  const breadcrumbSchemaData = getBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Sự kiện', url: `${baseUrl}/events` },
    { name: event.title, url: eventUrl },
  ])

  return (
    <ThemeProvider initialTheme={customTheme}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchemaData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaData) }} />

      {allEvents && <TimelineNav events={allEvents} />}

      <EventStickyHeader
        event={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          status: event.status,
          start_date: event.start_date,
          end_date: event.end_date,
          stats: event.stats,
        }}
        canUpload={canUpload}
      />

      <main className="min-h-screen">
        <EventHeroCover
          event={{
            title: event.title,
            description: event.description,
            status: event.status,
            start_date: event.start_date,
            end_date: event.end_date,
            cover_image_url: event.cover_image_url,
            stats: event.stats,
            branding: event.branding,
          }}
        />

        <div className="container mx-auto px-4 py-8">
          {focusedGreeting && (
            <Card id="event-greeting-focus" className="mb-6 border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-pink-700">
                  <Heart className="h-5 w-5" />
                  Lời chúc được mở từ thiệp
                </CardTitle>
                <CardDescription>Liên kết trực tiếp từ homepage</CardDescription>
              </CardHeader>
              <CardContent>
                <blockquote className="text-base italic text-gray-700 leading-relaxed">
                  &ldquo;{focusedGreeting.message}&rdquo;
                </blockquote>
                <p className="mt-2 text-sm text-gray-500">— {focusedGreeting.authorName}</p>
              </CardContent>
            </Card>
          )}

          {!posts || posts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Chưa có ảnh nào</CardTitle>
                <CardDescription>
                  {canUpload ? 'Hãy là người đầu tiên chia sẻ ảnh từ sự kiện này' : 'Quay lại sau để xem ảnh từ sự kiện này'}
                </CardDescription>
              </CardHeader>
              {canUpload && (
                <CardContent>
                  <UploadBottomSheet
                    events={[{
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      slug: event.slug,
                      cover_image_url: event.cover_image_url,
                      total_photos: event.stats.total_photos,
                      total_videos: event.stats.total_videos,
                      status: event.status as 'open' | 'closed' | 'draft',
                      allow_upload: event.allow_upload,
                    }]}
                    preSelectedEventId={event.id}
                    trigger={
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Tải Ảnh Đầu Tiên
                      </Button>
                    }
                  />
                </CardContent>
              )}
            </Card>
          ) : (
            <EventPhotos
              key={event.id}
              initialPosts={posts}
              eventId={event.id}
              initialFocusPostId={typeof postId === 'string' ? postId : undefined}
              userId={user?.id}
              userName={userName}
              avatarUrl={avatarUrl}
              initialNextCursor={nextCursor}
            />
          )}
        </div>

        {/* Social Bar - Mobile only */}
        <EventSocialBar eventId={event.id} />

        {/* Upload FAB */}
        {canUpload && posts && posts.length > 0 && (
          <StickyUploadFab eventId={event.id} eventTitle={event.title} />
        )}
      </main>
    </ThemeProvider>
  )
}
