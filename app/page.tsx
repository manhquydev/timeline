import { createClient } from '@/lib/supabase/server'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { TimelineNav } from '@/components/timeline/timeline-nav'
import { MemoryRiverTimeline } from '@/components/timeline/memory-river-timeline'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Heart, Camera } from 'lucide-react'

export const revalidate = 60 // Revalidate every 60 seconds

// Optimize: Use dynamic import for heavy components
export const dynamic = 'force-dynamic'

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
      const posts = await postRepository.findByEvent(event.id, 'approved')
      return { event, posts: posts.slice(0, 6) } // Reduced from 9 to 6 for faster load
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

  return (
    <>
      <main className="min-h-screen overflow-hidden">
        {/* Hero Section with Enhanced Animated Mesh Gradient */}
        <div className="relative min-h-[85vh] flex items-center gradient-animated overflow-hidden">
          {/* Animated Blob Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-[10%] w-96 h-96 bg-white/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-[20%] right-[15%] w-[500px] h-[500px] bg-white/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
            <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-white/18 rounded-full blur-3xl animate-blob" style={{ animationDelay: '6s' }} />
          </div>

          {/* Floating particles/sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          <div className="relative container mx-auto px-4 py-20 z-10">
            <div className="text-center text-white max-w-5xl mx-auto">
              {/* Icon with enhanced animation and glass effect */}
              <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl glass-gradient animate-scale-in hover-tilt hover-glow">
                <Camera className="w-12 h-12 text-primary drop-shadow-lg" />
              </div>

              {/* Title with enhanced fluid typography and glow */}
              <h1 className="text-fluid-4xl font-black mb-6 animate-slide-in tracking-tight leading-tight">
                <span className="inline-block bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent drop-shadow-2xl">
                  <span className="block">Timeline</span>
                  <span className="block">Teky Hoàng Mai</span>
                </span>
              </h1>

              <p className="text-fluid-xl mb-10 text-white/95 max-w-3xl mx-auto animate-slide-in font-medium leading-relaxed drop-shadow-lg" style={{ animationDelay: '0.15s' }}>
                Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ của Teky Hoàng Mai
              </p>

              {/* Enhanced CTA Buttons with glass morphism */}
              <div className="flex flex-wrap items-center justify-center gap-5 animate-slide-in stagger-fade-in" style={{ animationDelay: '0.3s' }}>
                {isAdmin && (
                  <Button
                    asChild
                    size="lg"
                    className="glass-gradient text-primary font-bold hover-lift hover-shimmer shadow-2xl text-lg px-8 py-6 rounded-2xl border-2 border-white/50"
                  >
                    <Link href="/admin/events/create">
                      <Plus className="h-6 w-6 mr-2" />
                      Tạo Sự Kiện Mới
                    </Link>
                  </Button>
                )}

                {eventsList && eventsList.length > 0 && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="glass text-primary border-2 border-primary/40 hover:border-primary/60 font-bold hover-lift text-lg px-8 py-6 rounded-2xl backdrop-blur-xl shadow-lg"
                  >
                    <Link href="#events">
                      <Sparkles className="h-6 w-6 mr-2" />
                      Khám Phá Ngay
                    </Link>
                  </Button>
                )}
              </div>

              {/* Enhanced Stats with glass cards */}
              {eventsList && eventsList.length > 0 && (
                <div className="mt-16 flex flex-wrap justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <div className="glass-gradient px-8 py-5 rounded-2xl hover-scale hover-glow transition-all min-w-[140px] shadow-lg">
                    <div className="text-fluid-3xl font-black text-primary mb-1 drop-shadow-md">{eventsList.length}</div>
                    <div className="text-fluid-sm font-semibold text-primary/80">Sự Kiện</div>
                  </div>
                  <div className="glass-gradient px-8 py-5 rounded-2xl hover-scale hover-glow transition-all min-w-[140px] shadow-lg">
                    <div className="text-fluid-3xl font-black text-primary mb-1 drop-shadow-md">
                      {eventsList.reduce((sum, e) => sum + e.total_photos, 0)}
                    </div>
                    <div className="text-fluid-sm font-semibold text-primary/80">Khoảnh Khắc</div>
                  </div>
                  <div className="glass-gradient px-8 py-5 rounded-2xl hover-scale hover-glow transition-all min-w-[140px] shadow-lg">
                    <div className="text-fluid-3xl font-black text-primary mb-1 drop-shadow-md">
                      {eventsList.reduce((sum, e) => sum + e.total_contributors, 0)}
                    </div>
                    <div className="text-fluid-sm font-semibold text-primary/80">Người Tham Gia</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Wave SVG Divider with smoother curve */}
          <div className="absolute bottom-0 left-0 right-0 text-background">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path
                d="M0 120L48 105C96 90 192 60 288 45C384 30 480 30 576 37.5C672 45 768 60 864 67.5C960 75 1056 75 1152 67.5C1248 60 1344 45 1392 37.5L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Timeline Navigation */}
        {eventsList && eventsList.length > 0 && (
          <div className="bg-background -mt-1">
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
                <h2 className="text-fluid-4xl font-black mb-4 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent leading-tight">
                  <span className="block md:inline">Dòng thời gian ở </span>
                  <span className="block md:inline">Teky Hoàng Mai</span>
                </h2>
                <p className="text-muted-foreground text-fluid-lg leading-relaxed">
                  Hành trình kỷ niệm của chúng ta qua từng sự kiện đáng nhớ
                </p>
              </div>

              <MemoryRiverTimeline events={events} />
            </>
          )}
        </div>

        {/* Enhanced Mobile FAB with gradient and glow */}
        {isAdmin && eventsList && eventsList.length > 0 && (
          <div className="fixed bottom-24 right-6 md:hidden z-50 animate-scale-in">
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
