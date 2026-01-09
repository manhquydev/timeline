import { createClient } from '@/lib/supabase/server'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { TimelineNav } from '@/components/timeline/timeline-nav'
import { TimelineSwitcher } from '@/components/timeline/timeline-switcher'
import { HeroSection } from '@/components/home/hero-section'
import { BentoStatsGrid } from '@/components/home/bento-stats-grid'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Heart } from 'lucide-react'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function Home() {
  // Parallel fetch optimization - fetch events and check auth simultaneously
  const [mongoEvents, supabase] = await Promise.all([
    eventRepository.findPublic(),
    createClient()
  ])

  // Get user (parallel with events fetch above)
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect authenticated users from landing page
  if (user) {
    const role = await (import('@/lib/auth-utils').then(m => m.getUserRole(user.id)))
    if (role === 'admin' || role === 'super_admin') {
      import('next/navigation').then(m => m.redirect('/admin'))
    } else if (role === 'moderator') {
      import('next/navigation').then(m => m.redirect('/moderator'))
    } else {
      // For regular users, jump to events section
      import('next/navigation').then(m => m.redirect('/#events'))
    }
  }

  // Check if user is admin (rest of the page logic)
  const isAdmin = user ? await isCurrentUserAdmin() : false

  // Fetch approved posts for each event - OPTIMIZED: only 6 posts for preview
  const eventsWithPosts = await Promise.all(
    mongoEvents.map(async (event) => {
      // Improved: Use findWithPagination to fetch specific limit directly from DB instead of fetching all
      const { posts } = await postRepository.findWithPagination(event.id, 1, 6, 'approved')
      return { event, posts }
    })
  )

  // Convert MongoDB documents to plain objects for client components
  const events = eventsWithPosts.map(({ event, posts }) => ({
    event: {
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
    },
    posts: posts.map(post => ({
      id: post.id,
      event_id: post.event_id,
      user_id: post.user_id || null,
      media_type: post.media_type,
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url || null,
      blurhash: post.blurhash || null,
      dimensions: {
        width: post.dimensions?.width || null,
        height: post.dimensions?.height || null,
      },
      file_size: post.file_size || null,
      wish_text: post.wish_text || null,
      uploaded_at: post.uploaded_at.toISOString(),
      view_count: post.view_count,
      status: post.status,
    }))
  }))

  // Extract just events for components that don't need posts
  const eventsList = events.map(e => e.event)

  // Calculate totals for BentoStatsGrid
  const totalPhotos = eventsList.reduce((sum, e) => sum + e.total_photos, 0)
  const totalContributors = eventsList.reduce((sum, e) => sum + e.total_contributors, 0)

  return (
    <>
      <main className="min-h-screen overflow-hidden">
        {/* Enhanced Hero Section with Kinetic Typography */}
        <HeroSection isAdmin={isAdmin} hasEvents={eventsList.length > 0} />

        {/* Bento-style Stats Grid with Animated Counters */}
        {eventsList.length > 0 && (
          <BentoStatsGrid
            totalEvents={eventsList.length}
            totalPhotos={totalPhotos}
            totalContributors={totalContributors}
          />
        )}

        {/* Timeline Navigation */}
        {eventsList && eventsList.length > 0 && (
          <div className="bg-background">
            <TimelineNav events={eventsList} />
          </div>
        )}

        {/* Events Grid with Enhanced Layout */}
        <div id="events" className="container mx-auto px-4 py-16 md:py-20">
          {!eventsList || eventsList.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-28 h-28 mb-8 rounded-3xl gradient-2 animate-pulse-slow shadow-2xl">
                <Heart className="w-14 h-14 text-white drop-shadow-lg" />
              </div>

              <h2 className="text-fluid-3xl font-black mb-5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Chưa có sự kiện nào
              </h2>
              <p className="text-muted-foreground text-fluid-lg mb-10 max-w-md mx-auto leading-relaxed">
                Hãy là người đầu tiên tạo sự kiện và bắt đầu chia sẻ những khoảnh khắc đẹp
              </p>

              {isAdmin && (
                <Button asChild size="lg" className="hover-lift hover-glow ripple shadow-xl text-lg px-8 py-6 rounded-2xl gradient-1 text-white font-bold">
                  <Link href="/admin/events/create">
                    <Plus className="h-6 w-6 mr-2" />
                    Tạo Sự Kiện Đầu Tiên
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="heading-section text-fluid-4xl font-black mb-4 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent leading-tight">
                  <span className="inline">Dòng thời gian ở </span>
                  <span className="inline whitespace-nowrap">Teky Hoàng Mai</span>
                </h2>
                <p className="text-muted-foreground text-fluid-lg leading-relaxed">
                  Hành trình kỷ niệm của chúng ta qua từng sự kiện đáng nhớ
                </p>
              </div>

              <TimelineSwitcher events={events} />
            </>
          )}
        </div>

        {/* Enhanced Mobile FAB with gradient and glow - positioned above Upload FAB */}
        {isAdmin && eventsList && eventsList.length > 0 && (
          <div className="fixed bottom-44 right-4 md:hidden z-50 animate-scale-in">
            <Button
              asChild
              size="lg"
              className="rounded-full h-16 w-16 shadow-2xl gradient-animated hover-lift hover-glow ripple border-4 border-white/30"
            >
              <Link href="/admin/events/create">
                <Plus className="h-8 w-8 text-white drop-shadow-lg" />
              </Link>
            </Button>
          </div>
        )}
      </main>
    </>
  )
}
