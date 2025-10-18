import { Suspense } from 'react'
import { EnhancedAuthForm } from '@/components/auth/enhanced-auth-form'
import { Camera, Sparkles, Shield, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Đăng nhập | Timeline Teky Hoàng Mai',
  description: 'Đăng nhập để chia sẻ kỷ niệm của Teky Hoàng Mai',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 gradient-1 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 text-white group">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">Timeline Teky Hoàng Mai</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Chào Mừng<br />Trở Lại!
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Đăng nhập để tiếp tục chia sẻ và xem lại những khoảnh khắc đẹp của Teky Hoàng Mai.
          </p>

          {/* Feature list */}
          <div className="space-y-4 pt-8">
            {[
              { icon: Camera, text: 'Tải lên & chia sẻ ảnh không giới hạn' },
              { icon: Users, text: 'Kết nối với đồng nghiệp' },
              { icon: Shield, text: 'Bảo mật và an toàn tuyệt đối' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <feature.icon className="w-4 h-4" />
                </div>
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/70 text-sm">
          <p>© 2025 Timeline Teky Hoàng Mai. Mọi quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl gradient-1 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Timeline Teky Hoàng Mai</span>
            </Link>
          </div>

          {/* Form header */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Đăng Nhập</h2>
            <p className="text-muted-foreground">
              Chọn phương thức đăng nhập bạn muốn
            </p>
          </div>

          {/* Auth form */}
          <div className="animate-scale-in">
            <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="spinner" /></div>}>
              <EnhancedAuthForm mode="login" />
            </Suspense>
          </div>

          {/* Additional info */}
          <div className="text-center space-y-4">
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Chưa có tài khoản?
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center text-sm font-semibold text-primary hover:underline"
              >
                Tham gia ngay
                <Sparkles className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
