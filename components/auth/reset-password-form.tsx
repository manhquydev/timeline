'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Check if user has valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsValidSession(false)
        setMessage({
          type: 'warning',
          text: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.',
        })
      } else {
        setIsValidSession(true)
      }
    }

    checkSession()
  }, [supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Validation
      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự')
      }

      if (password !== confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp')
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)
      setMessage({
        type: 'success',
        text: 'Mật khẩu đã được cập nhật thành công! Đang chuyển hướng đến trang đăng nhập...',
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Show warning if session is invalid
  if (isValidSession === false) {
    return (
      <Card className="w-full border shadow-sm">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center border-2 border-amber-500">
              <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-900">Link không hợp lệ</h3>
          <p className="text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            Vui lòng yêu cầu link mới.
          </p>
          <Button
            onClick={() => router.push('/forgot-password')}
            className="bg-slate-900 hover:bg-slate-800"
          >
            Yêu cầu link mới
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show loading while checking session
  if (isValidSession === null) {
    return (
      <Card className="w-full border shadow-sm">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-4">
            <span className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
          <p className="text-slate-600">Đang xác thực...</p>
        </CardContent>
      </Card>
    )
  }

  // Show success message
  if (success) {
    return (
      <Card className="w-full border shadow-sm">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-500">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-900">Thành công!</h3>
          <p className="text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
            Mật khẩu của bạn đã được cập nhật thành công.
            Đang chuyển hướng đến trang đăng nhập...
          </p>
          <div className="flex justify-center">
            <span className="w-6 h-6 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-8 pb-8 px-8">
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Tối thiểu 6 ký tự
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password strength indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      password.length > i * 2
                        ? password.length < 6
                          ? 'bg-rose-500'
                          : password.length < 10
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                password.length < 6
                  ? 'text-rose-600'
                  : password.length < 10
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}>
                {password.length < 6
                  ? 'Mật khẩu yếu'
                  : password.length < 10
                  ? 'Mật khẩu trung bình'
                  : 'Mật khẩu mạnh'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 font-medium bg-slate-900 hover:bg-slate-800 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Đang cập nhật...
              </span>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </Button>

          {/* Message Display */}
          {message && (
            <div
              className={`rounded-lg border-l-4 p-4 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-500'
                  : message.type === 'error'
                  ? 'bg-rose-50 border-rose-500'
                  : 'bg-amber-50 border-amber-500'
              }`}
            >
              <p className={`text-sm font-medium mb-1 ${
                message.type === 'success'
                  ? 'text-emerald-900'
                  : message.type === 'error'
                  ? 'text-rose-900'
                  : 'text-amber-900'
              }`}>
                {message.type === 'success' && 'Thành công'}
                {message.type === 'error' && 'Lỗi'}
                {message.type === 'warning' && 'Cảnh báo'}
              </p>
              <p className={`text-sm ${
                message.type === 'success'
                  ? 'text-emerald-700'
                  : message.type === 'error'
                  ? 'text-rose-700'
                  : 'text-amber-700'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Security tips */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">
                Mẹo tạo mật khẩu mạnh:
              </p>
              <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Sử dụng ít nhất 8 ký tự</li>
                <li>Kết hợp chữ hoa, chữ thường và số</li>
                <li>Thêm ký tự đặc biệt (@, #, !, etc.)</li>
                <li>Không dùng thông tin cá nhân dễ đoán</li>
              </ul>
            </div>
          </div>
        </form>

        {/* Security Badge */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-xs text-slate-500">
            Mật khẩu được mã hóa an toàn
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
