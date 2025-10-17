import { createClient } from '@/lib/supabase/server'
import { postRepository } from '@/lib/mongodb/repositories'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { WallGrid } from '@/components/wall/wall-grid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Camera, Heart, Image as ImageIcon, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export const revalidate = 30

interface WallPageProps {
  params: Promise<{
    userId: string
  }>
}

export async function generateMetadata({ params }: WallPageProps) {
  const { userId } = await params

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()

  const displayName = (profile as any)?.display_name || 'Người dùng'

  return {
    title: `Tường của ${displayName} | Timeline Teky Hoàng Mai`,
    description: `Xem tất cả khoảnh khắc được chia sẻ bởi ${displayName}`,
  }
}

export default async function WallPage({ params }: WallPageProps) {
  const { userId } = await params
  const supabase = await createClient()

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('display_name, avatar_url, created_at')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch user's approved posts from MongoDB
  const mongoPosts = await postRepository.findByUser(userId)
  const approvedPosts = mongoPosts.filter(p => p.status === 'approved')

  // Convert to plain objects
  const posts = approvedPosts.map(p => ({
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

  const displayName = (profile as any).display_name || 'Người dùng'
  const avatar_url = (profile as any).avatar_url
  const created_at = (profile as any).created_at
  const totalPosts = posts.length
  const totalViews = posts.reduce((sum, p) => sum + p.view_count, 0)

  return (
    <main className="min-h-screen bg-background">
      {/* Header with gradient background */}
      <div className="relative gradient-animated overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-[20%] right-[15%] w-80 h-80 bg-white/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-16 z-10">
          {/* Back button */}
          <Button
            asChild
            variant="ghost"
            className="mb-6 text-white/90 hover:text-white hover:bg-white/10"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Link>
          </Button>

          {/* User profile section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-white">
            {/* Avatar */}
            <div className="relative">
              {avatar_url ? (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl">
                  <Image
                    src={avatar_url}
                    alt={displayName}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 shadow-2xl">
                  <Camera className="w-16 h-16 text-white/70" />
                </div>
              )}
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-primary font-bold shadow-lg">
                {totalPosts} bài viết
              </Badge>
            </div>

            {/* User info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-2 drop-shadow-lg">
                  {displayName}
                </h1>
                <p className="text-white/90 text-lg flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Tham gia {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: vi })}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Card className="glass-gradient border-white/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-primary">{totalPosts}</div>
                      <div className="text-xs text-primary/80 font-semibold">Khoảnh khắc</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-gradient border-white/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-primary">{totalViews}</div>
                      <div className="text-xs text-primary/80 font-semibold">Lượt xem</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 text-background">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 80L48 70C96 60 192 40 288 30C384 20 480 20 576 25C672 30 768 40 864 45C960 50 1056 50 1152 45C1248 40 1344 30 1392 25L1440 20V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Posts section */}
      <div className="container mx-auto px-4 py-8 -mt-1">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full gradient-2 shadow-xl">
                <ImageIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Chưa có bài viết nào</h2>
              <p className="text-muted-foreground">
                {displayName} chưa chia sẻ khoảnh khắc nào
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Khoảnh Khắc Của {displayName}
              </h2>
              <p className="text-muted-foreground">
                Tất cả những khoảnh khắc đáng nhớ đã được chia sẻ
              </p>
            </div>
            <WallGrid posts={posts} />
          </>
        )}
      </div>
    </main>
  )
}
