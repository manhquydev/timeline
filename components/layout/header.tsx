'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, Home, Upload, LayoutDashboard, User, LogOut, ShieldCheck, Settings, Info, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Timeline', icon: Home },
    { href: '/about', label: 'Về Chúng Tôi', icon: Info },
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
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-target">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    <img
                      src="https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg"
                      alt="Teky Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-base font-bold">Timeline Teky</span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map(item => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-3 h-12 text-base',
                          isActive && 'bg-primary/10 text-primary font-semibold'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}

                {/* Mobile Auth Buttons */}
                {!user && (
                  <>
                    <div className="my-4 border-t" />
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-12 text-base border-2">
                        Đăng Nhập
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-12 text-base gradient-2 hover-lift font-semibold shadow-lg">
                        <Camera className="w-5 h-5 mr-2" />
                        Tham Gia Ngay
                      </Button>
                    </Link>
                  </>
                )}

                {/* Mobile User Menu Items */}
                {user && (
                  <>
                    <div className="my-4 border-t" />
                    <div className="px-3 py-2 text-sm">
                      <p className="font-semibold">{user.user_metadata?.full_name || 'Người dùng'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="text-xs px-2 py-0.5 rounded-full gradient-1 text-white inline-block w-fit mt-2">
                          Quản trị
                        </span>
                      )}
                      {isModerator && !isAdmin && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white inline-block w-fit mt-2">
                          Kiểm duyệt
                        </span>
                      )}
                    </div>
                    <Link href="/profile/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                        <Settings className="w-5 h-5" />
                        Cài Đặt Hồ Sơ
                      </Button>
                    </Link>
                    <div className="mt-2">
                      <SignOutButton />
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform md:block hidden">
            <img
              src="https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg"
              alt="Teky Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold sm:inline-block">
            Timeline Teky Hoàng Mai
          </span>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Desktop User Menu / Login */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Mobile Nav Menu - REMOVED: Now using Bottom Navigation */}

              {/* User Avatar Menu - Mobile Optimized */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="touch-target-sm relative rounded-full p-0">
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
                    <Link href="/profile/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Cài Đặt Hồ Sơ
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
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="outline" className="border-2">
                  Đăng Nhập
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="gradient-2 hover-lift hover-glow ripple font-semibold shadow-lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Tham Gia Ngay
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
