import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Camera, Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Đặt lại mật khẩu | Timeline Teky Hoàng Mai',
  description: 'Tạo mật khẩu mới cho tài khoản của bạn',
}

export default function ResetPasswordPage() {
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
            Tạo Mật Khẩu<br />Mới
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Chọn một mật khẩu mạnh để bảo vệ tài khoản của bạn.
          </p>

          {/* Security Tips */}
          <div className="space-y-4 pt-8">
            {[
              { icon: Shield, text: 'Sử dụng ít nhất 8 ký tự' },
              { icon: Shield, text: 'Kết hợp chữ và số' },
              { icon: Shield, text: 'Không sử dụng mật khẩu dễ đoán' },
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <tip.icon className="w-4 h-4" />
                </div>
                <span className="text-lg">{tip.text}</span>
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

          {/* Form header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Đặt lại mật khẩu</h2>
            <p className="text-muted-foreground">
              Tạo mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {/* Form */}
          <div className="animate-scale-in">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
