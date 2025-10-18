'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, Loader2, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react'
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
      <Card className="w-full border-0 shadow-2xl">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
              <Shield className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Link không hợp lệ</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            Vui lòng yêu cầu link mới.
          </p>
          <Button
            onClick={() => router.push('/forgot-password')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
      <Card className="w-full border-0 shadow-2xl">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-muted-foreground">Đang xác thực...</p>
        </CardContent>
      </Card>
    )
  }

  // Show success message
  if (success) {
    return (
      <Card className="w-full border-0 shadow-2xl">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Thành công!</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Mật khẩu của bạn đã được cập nhật thành công.
            Đang chuyển hướng đến trang đăng nhập...
          </p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 shadow-2xl">
      <CardContent className="pt-6">
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" />
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
                className="h-12 text-base border-2 focus:border-purple-500 transition-colors pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tối thiểu 6 ký tự
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
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
                className="h-12 text-base border-2 focus:border-green-500 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length > i * 2
                        ? password.length < 6
                          ? 'bg-red-500'
                          : password.length < 10
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                password.length < 6
                  ? 'text-red-600'
                  : password.length < 10
                  ? 'text-yellow-600'
                  : 'text-green-600'
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
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                Đặt lại mật khẩu
                <Lock className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {/* Message Display */}
          {message && (
            <div
              className={`text-sm p-4 rounded-xl animate-in slide-in-from-top-2 duration-300 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border-2 border-green-200'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 border-2 border-red-200'
                  : 'bg-yellow-50 text-yellow-800 border-2 border-yellow-200'
              }`}
            >
              <p className="font-semibold mb-1">
                {message.type === 'success' && '✓ Thành công!'}
                {message.type === 'error' && '✗ Lỗi!'}
                {message.type === 'warning' && '⚠ Cảnh báo!'}
              </p>
              <p className="text-xs leading-relaxed">{message.text}</p>
            </div>
          )}

          {/* Security tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3 text-xs">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-2">
                  Mẹo tạo mật khẩu mạnh:
                </p>
                <ul className="text-blue-800 space-y-1 list-disc list-inside">
                  <li>Sử dụng ít nhất 8 ký tự</li>
                  <li>Kết hợp chữ hoa, chữ thường và số</li>
                  <li>Thêm ký tự đặc biệt (@, #, !, etc.)</li>
                  <li>Không dùng thông tin cá nhân dễ đoán</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* Security Badge */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Mật khẩu được mã hóa an toàn</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
