import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { UploadFAB } from "@/components/layout/upload-fab";
import { ThemeProvider } from "@/lib/themes/theme-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { GlobalProgressBar } from "@/components/ui/progress-bar";
import { ThemeBanner } from "@/components/theme/theme-banner";
import { EventNotificationPopup, FallingPetals } from "@/components/layout/client-only-components";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin, isModerator as checkIsModerator } from "@/lib/auth-utils";
import { themeRepository } from "@/lib/mongodb/repositories";
import { connectToDatabase } from "@/lib/mongodb/connection";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/seo/structured-data";
import { SocialNotificationListener } from "@/components/social/social-notification-listener";
import { LiveReactions } from "@/components/social/live-reactions";
import "./globals.css";
import { unstable_cache } from "next/cache";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "Timeline Teky Hoàng Mai - Lưu Giữ Khoảnh Khắc Đáng Nhớ",
    template: "%s | Timeline Teky Hoàng Mai"
  },
  description: "Nền tảng chia sẻ ảnh sự kiện cho Teky Hoàng Mai. Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ với bạn bè và gia đình. Upload ảnh, xem timeline sự kiện, và kết nối cộng đồng.",
  keywords: ["Teky Hoàng Mai", "timeline", "chia sẻ ảnh", "sự kiện", "kỷ niệm", "album ảnh", "gallery", "photo sharing", "event timeline"],
  authors: [{ name: "Teky Hoàng Mai Team" }],
  creator: "Teky Hoàng Mai",
  publisher: "Teky Hoàng Mai",
  icons: {
    icon: "https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg",
    apple: "https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg",
    shortcut: "https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Timeline Teky Hoàng Mai",
    title: "Timeline Teky Hoàng Mai - Lưu Giữ Khoảnh Khắc Đáng Nhớ",
    description: "Nền tảng chia sẻ ảnh sự kiện cho Teky Hoàng Mai. Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ.",
    images: [{
      url: "https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg",
      width: 1200,
      height: 630,
      alt: "Timeline Teky Hoàng Mai"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Timeline Teky Hoàng Mai - Lưu Giữ Khoảnh Khắc Đáng Nhớ",
    description: "Nền tảng chia sẻ ảnh sự kiện cho Teky Hoàng Mai. Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ.",
    images: ["https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    // google: 'your-google-site-verification-code', // Add after creating Google Search Console
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

// Cache theme fetching to prevent DB hits on every request
const getCachedActiveTheme = unstable_cache(
  async () => {
    try {
      await connectToDatabase()
      const theme = await themeRepository.findActive()
      if (!theme) return null

      // Serialize theme to plain object for client component
      return JSON.parse(JSON.stringify({
        id: theme.id,
        name: theme.name,
        displayName: theme.displayName,
        description: theme.description,
        colors: theme.colors,
        gradients: theme.gradients,
        effects: theme.effects,
        coverImage: theme.coverImage,
        icon: theme.icon,
        isActive: theme.isActive,
        createdAt: theme.createdAt.toISOString(),
        updatedAt: theme.updatedAt.toISOString(),
        createdBy: theme.createdBy,
      }))
    } catch (error) {
      console.error('Failed to fetch active theme:', error)
      return null
    }
  },
  ['active-theme'],
  { revalidate: 60, tags: ['theme'] }
)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin or moderator from database
  const isAdmin = user ? await isCurrentUserAdmin() : false
  const isModerator = user ? await checkIsModerator(user.id) : false

  // Fetch active theme from cached function
  let activeTheme = await getCachedActiveTheme()

  return (
    <html lang="vi" className={`${inter.variable} ${beVietnamPro.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch & Preconnect for faster resource loading */}
        <link rel="dns-prefetch" href="https://lzaiqncbegvzlocyawrj.supabase.co" />
        <link rel="preconnect" href="https://lzaiqncbegvzlocyawrj.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="anonymous" />

        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Timeline" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Force light mode - dark mode disabled for consistent UX */}
        {/* Microsoft Clarity Analytics */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "trrix6qrk4");
            `,
          }}
        />

        {/* Structured Data - Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />

        {/* Structured Data - Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebsiteSchema()),
          }}
        />
      </head>
      <body className={`${inter.className} font-body`}>
        
        <QueryProvider>
          <ThemeProvider initialTheme={activeTheme}>
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
          >
            Chuyển đến nội dung chính
          </a>
          <GlobalProgressBar />
          {/* Theme banner - Shows when special theme is active */}
          <ThemeBanner />
          <div className="flex flex-col min-h-screen">
            <Header user={user} isAdmin={isAdmin} isModerator={isModerator} />
            <LiveReactions />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <MobileBottomNav user={user} isAdmin={isAdmin} isModerator={isModerator} />
          {/* Floating action button for quick photo upload */}
          {user && <UploadFAB />}
          <Toaster />
          {/* Event notification popup - only shows for active events */}
          <EventNotificationPopup />
          {/* Falling petals effect - only for special themes */}
          <FallingPetals />
          <SocialNotificationListener userId={user?.id} />
        </ThemeProvider>
        </QueryProvider>
        
      </body>
    </html>
  );
}
