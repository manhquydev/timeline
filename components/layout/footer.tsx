import Link from 'next/link'
import Image from 'next/image'
import { Heart, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12 pb-20 md:pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">

          {/* Brand & About Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden group-hover:scale-110 transition-transform relative">
                <Image
                  src="https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg"
                  alt="Teky Logo"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="text-lg font-bold text-foreground">
                Timeline Teky Hoàng Mai
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md text-[15px] md:text-sm">
              Nền tảng chia sẻ ảnh sự kiện hiện đại - Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ với cộng đồng Teky Hoàng Mai.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-base">Liên Kết</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 touch-target-sm text-[15px] md:text-sm font-medium"
                >
                  Timeline
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 touch-target-sm text-[15px] md:text-sm font-medium"
                >
                  Về Chúng Tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-base">Chính Sách</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 touch-target-sm text-[15px] md:text-sm font-medium"
                >
                  Bảo Mật
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 touch-target-sm text-[15px] md:text-sm font-medium"
                >
                  Điều Khoản
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6"></div>

        {/* Bottom Bar - Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="text-center md:text-left">
            © {currentYear} Timeline Teky Hoàng Mai. Phát triển bởi Team Giảng Viên.
          </p>
          <p className="flex items-center gap-2 text-center md:text-right">
            Được xây dựng với <Heart className="w-4 h-4 text-red-500 fill-red-500" /> tại Việt Nam
          </p>
        </div>
      </div>
    </footer>
  )
}
