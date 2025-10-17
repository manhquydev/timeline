import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/lib/themes/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin, isModerator as checkIsModerator } from "@/lib/auth-utils";
import { themeRepository } from "@/lib/mongodb/repositories";
import { connectToDatabase } from "@/lib/mongodb/connection";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dòng Thời Gian Kỷ Niệm Công Ty",
  description: "Chia sẻ và sống lại kỷ niệm công ty cùng nhau",
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
      <body className={inter.className}>
        <ThemeProvider initialTheme={activeTheme}>
          <Header user={user} isAdmin={isAdmin} isModerator={isModerator} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
