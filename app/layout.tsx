import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ThemeProvider } from "@/lib/themes/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { GlobalProgressBar } from "@/components/ui/progress-bar";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin, isModerator as checkIsModerator } from "@/lib/auth-utils";
import { themeRepository } from "@/lib/mongodb/repositories";
import { connectToDatabase } from "@/lib/mongodb/connection";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Timeline Teky Hoàng Mai",
  description: "Chia sẻ và lưu giữ kỷ niệm của Teky Hoàng Mai",
  icons: {
    icon: "https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg",
    apple: "https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg",
  },
};

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

  // Fetch active theme from MongoDB
  let activeTheme: any = null
  try {
    await connectToDatabase()
    const theme = await themeRepository.findActive()
    if (theme) {
      // Serialize theme to plain object for client component
      activeTheme = JSON.parse(JSON.stringify({
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
    }
  } catch (error) {
    console.error('Failed to fetch active theme:', error)
  }

  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <head>
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
      </head>
      <body className={inter.className}>
        <ThemeProvider initialTheme={activeTheme}>
          <GlobalProgressBar />
          <Header user={user} isAdmin={isAdmin} isModerator={isModerator} />
          <div className="pb-safe pb-16 md:pb-0">
            {children}
          </div>
          <MobileBottomNav user={user} isAdmin={isAdmin} isModerator={isModerator} />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
