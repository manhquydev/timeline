import { EnhancedAuthForm } from '@/components/auth/enhanced-auth-form'
import { Camera, Sparkles, Shield, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Tham gia ngay | Timeline Teky Hoàng Mai',
  description: 'Đăng ký tài khoản để chia sẻ kỷ niệm của Teky Hoàng Mai',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 gradient-2 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
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
            Tham Gia<br />Cộng Đồng Teky Hoàng Mai
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Bắt đầu chia sẻ những khoảnh khắc đẹp và kết nối với đồng nghiệp ngay hôm nay.
          </p>

          {/* Benefits list */}
          <div className="space-y-4 pt-8">
            {[
              {
                icon: Camera,
                title: 'Chia sẻ không giới hạn',
                desc: 'Tải lên ảnh từ mọi sự kiện của công ty'
              },
              {
                icon: Users,
                title: 'Kết nối đồng nghiệp',
                desc: 'Xem và tương tác với ảnh của mọi người'
              },
              {
                icon: Zap,
                title: 'Nhanh & Dễ dàng',
                desc: 'Đăng ký chỉ trong 30 giây'
              },
              {
                icon: Shield,
                title: 'An toàn & Bảo mật',
                desc: 'Dữ liệu được mã hóa và bảo vệ'
              },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 text-white/90">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-1">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">{benefit.title}</p>
                  <p className="text-sm text-white/75">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/70 text-sm">
          <p>© 2025 Timeline Teky Hoàng Mai. Mọi quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl gradient-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Timeline Teky Hoàng Mai</span>
            </Link>
          </div>

          {/* Form header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-2 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Tham Gia Ngay</h2>
            <p className="text-muted-foreground">
              Tạo tài khoản để bắt đầu chia sẻ khoảnh khắc
            </p>
          </div>

          {/* Auth form */}
          <div className="animate-scale-in">
            <EnhancedAuthForm mode="signup" />
          </div>

          {/* Additional info */}
          <div className="text-center space-y-4">
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Đã có tài khoản?
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-sm font-semibold text-primary hover:underline"
              >
                Đăng nhập ngay
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
