'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, Home, Upload, LayoutDashboard, User, LogOut, ShieldCheck, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  user?: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  } | null
  isAdmin?: boolean
  isModerator?: boolean
}

export function Header({ user, isAdmin, isModerator }: HeaderProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Timeline', icon: Home },
    ...(user
      ? [
          { href: '/upload', label: 'Tải Ảnh', icon: Upload },
          ...(isModerator && !isAdmin ? [{ href: '/moderator', label: 'Kiểm Duyệt', icon: ShieldCheck }] : []),
          ...(isAdmin ? [{ href: '/admin', label: 'Quản Trị', icon: LayoutDashboard }] : []),
        ]
      : []),
  ]

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform">
            <img
              src="https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg"
              alt="Teky Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">
            Timeline Teky Hoàng Mai
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'gap-2 transition-all',
                    isActive && 'bg-primary/10 text-primary font-semibold'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Menu / Login */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Mobile Nav Menu */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <LayoutDashboard className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {navItems.map(item => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* User Avatar Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="gradient-2 text-white font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user.user_metadata?.full_name || 'Người dùng'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="text-xs px-2 py-0.5 rounded-full gradient-1 text-white inline-block w-fit">
                          Quản trị
                        </span>
                      )}
                      {isModerator && !isAdmin && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white inline-block w-fit">
                          Kiểm duyệt
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Cài đặt tên hiển thị
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button className="gradient-1 hover-lift hover-glow ripple">
                Đăng Nhập
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
