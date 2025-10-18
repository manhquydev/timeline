import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Camera, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Quên mật khẩu | Timeline Teky Hoàng Mai',
  description: 'Khôi phục mật khẩu tài khoản của bạn',
}

export default function ForgotPasswordPage() {
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
            Khôi Phục<br />Tài Khoản
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản.
          </p>

          {/* Steps */}
          <div className="space-y-4 pt-8">
            {[
              { step: '1', text: 'Nhập email của bạn' },
              { step: '2', text: 'Kiểm tra hộp thư đến' },
              { step: '3', text: 'Đặt mật khẩu mới' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <span className="text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/70 text-sm">
          <p>© 2025 Timeline Teky Hoàng Mai. Mọi quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right Side - Form */}
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

          {/* Back to login link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại đăng nhập
          </Link>

          {/* Form header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Quên mật khẩu?</h2>
            <p className="text-muted-foreground">
              Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu
            </p>
          </div>

          {/* Form */}
          <div className="animate-scale-in">
            <ForgotPasswordForm />
          </div>

          {/* Additional info */}
          <div className="text-center space-y-4">
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Bạn nhớ mật khẩu rồi?
              </p>
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
