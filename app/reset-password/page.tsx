import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import Link from 'next/link'

export const metadata = {
  title: 'Đặt lại mật khẩu | Timeline Teky Hoàng Mai',
  description: 'Tạo mật khẩu mới cho tài khoản của bạn',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 text-white group transition-all hover:opacity-90">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold">Timeline Teky Hoàng Mai</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
              Tạo Mật Khẩu<br />Mới
            </h1>
            <p className="text-xl text-white/80 max-w-md leading-relaxed">
              Chọn một mật khẩu mạnh để bảo vệ tài khoản của bạn.
            </p>
          </div>

          {/* Security Tips - Typography only */}
          <div className="space-y-4 pt-4">
            <div className="pl-4 border-l-2 border-white/30">
              <p className="text-lg text-white/90 font-medium">Sử dụng ít nhất 8 ký tự</p>
            </div>
            <div className="pl-4 border-l-2 border-white/30">
              <p className="text-lg text-white/90 font-medium">Kết hợp chữ và số</p>
            </div>
            <div className="pl-4 border-l-2 border-white/30">
              <p className="text-lg text-white/90 font-medium">Không sử dụng mật khẩu dễ đoán</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          <p>© 2025 Timeline Teky Hoàng Mai. Mọi quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center group-hover:shadow-lg transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900">Timeline Teky Hoàng Mai</span>
            </Link>
          </div>

          {/* Form header */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Đặt lại mật khẩu</h2>
            <p className="text-slate-600">
              Tạo mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {/* Form */}
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
