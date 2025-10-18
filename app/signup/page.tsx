import { EnhancedAuthForm } from '@/components/auth/enhanced-auth-form'
import Link from 'next/link'

export const metadata = {
  title: 'Tham gia ngay | Timeline Teky Hoàng Mai',
  description: 'Đăng ký tài khoản để chia sẻ kỷ niệm của Teky Hoàng Mai',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl" />
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
              Tham Gia<br />Cộng Đồng Teky
            </h1>
            <p className="text-xl text-white/80 max-w-md leading-relaxed">
              Bắt đầu chia sẻ những khoảnh khắc đẹp và kết nối với đồng nghiệp ngay hôm nay.
            </p>
          </div>

          {/* Benefits list - Typography only */}
          <div className="space-y-5 pt-4">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">Chia sẻ không giới hạn</p>
              <p className="text-sm text-white/70 pl-4 border-l-2 border-white/30">
                Tải lên ảnh từ mọi sự kiện của công ty
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">Kết nối đồng nghiệp</p>
              <p className="text-sm text-white/70 pl-4 border-l-2 border-white/30">
                Xem và tương tác với ảnh của mọi người
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">Nhanh & Dễ dàng</p>
              <p className="text-sm text-white/70 pl-4 border-l-2 border-white/30">
                Đăng ký chỉ trong 30 giây
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">An toàn & Bảo mật</p>
              <p className="text-sm text-white/70 pl-4 border-l-2 border-white/30">
                Dữ liệu được mã hóa và bảo vệ
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          <p>© 2025 Timeline Teky Hoàng Mai. Mọi quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center group-hover:shadow-lg transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900">Timeline Teky Hoàng Mai</span>
            </Link>
          </div>

          {/* Form header */}
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tham Gia Ngay</h2>
            <p className="text-slate-600">
              Tạo tài khoản để bắt đầu chia sẻ khoảnh khắc
            </p>
          </div>

          {/* Auth form */}
          <EnhancedAuthForm mode="signup" />

          {/* Additional info */}
          <div className="text-center space-y-4">
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-3">
                Đã có tài khoản?
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
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
