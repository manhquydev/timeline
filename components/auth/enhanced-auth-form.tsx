'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type AuthMode = 'login' | 'signup'

export function EnhancedAuthForm({ mode: initialMode = 'login' }: { mode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [authMethod, setAuthMethod] = useState<'password' | 'magiclink'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for verification success message from URL
  useEffect(() => {
    const messageType = searchParams.get('message')
    if (messageType === 'verified') {
      setMessage({
        type: 'success',
        text: 'Tài khoản của bạn đã được xác thực thành công! Vui lòng đăng nhập để tiếp tục.',
      })
      // Clear URL params
      window.history.replaceState({}, '', '/login')
    }
  }, [searchParams])

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signup') {
        // Validation for signup
        if (password !== confirmPassword) {
          throw new Error('Mật khẩu xác nhận không khớp')
        }
        if (password.length < 6) {
          throw new Error('Mật khẩu phải có ít nhất 6 ký tự')
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        if (data.user?.identities?.length === 0) {
          throw new Error('Email này đã được đăng ký. Vui lòng đăng nhập.')
        }

        setMessage({
          type: 'success',
          text: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        })
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMessage({
          type: 'success',
          text: 'Đăng nhập thành công! Đang chuyển hướng...',
        })

        // Redirect to home page after successful login
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1000)
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Có lỗi xảy ra'

      // Translate common errors to Vietnamese
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Email hoặc mật khẩu không đúng'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Vui lòng xác thực email trước khi đăng nhập'
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Email này đã được đăng ký'
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: mode === 'signup',
        },
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Kiểm tra email của bạn để lấy đường link đăng nhập!',
      })
      setEmail('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Có lỗi xảy ra',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-8 pb-8 px-8">
        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setMode('login')}
            className={`px-8 py-2.5 rounded-lg font-medium transition-all ${
              mode === 'login'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-8 py-2.5 rounded-lg font-medium transition-all ${
              mode === 'signup'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Auth Method Tabs */}
        <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-50">
            <TabsTrigger value="password" className="data-[state=active]:bg-white">
              Mật khẩu
            </TabsTrigger>
            <TabsTrigger value="magiclink" className="data-[state=active]:bg-white">
              Magic Link
            </TabsTrigger>
          </TabsList>

          {/* Password Auth */}
          <TabsContent value="password" className="space-y-0">
            <form onSubmit={handlePasswordAuth} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Địa chỉ email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Mật khẩu
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
                    className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-slate-500">
                    Tối thiểu 6 ký tự
                  </p>
                )}
              </div>

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
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
                      className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400 pr-12"
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
              )}

              {/* Forgot Password Link (Login only) */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 font-medium bg-slate-900 text-white hover:bg-slate-800 hover:text-white transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập'
                )}
              </Button>

              {/* Info text for signup */}
              {mode === 'signup' && (
                <p className="text-xs text-center text-slate-500 leading-relaxed">
                  Bằng cách đăng ký, bạn đồng ý với{' '}
                  <Link href="/terms" className="text-slate-700 hover:text-slate-900 font-medium">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-slate-700 hover:text-slate-900 font-medium">
                    Chính sách bảo mật
                  </Link>
                </p>
              )}
            </form>
          </TabsContent>

          {/* Magic Link Auth */}
          <TabsContent value="magiclink" className="space-y-0">
            <form onSubmit={handleMagicLink} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="magiclink-email" className="text-sm font-medium text-slate-700">
                  Địa chỉ email
                </Label>
                <Input
                  id="magiclink-email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
                <p className="text-xs text-slate-500">
                  Chúng tôi sẽ gửi link bảo mật để {mode === 'login' ? 'đăng nhập' : 'đăng ký'}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-slate-900 text-white hover:bg-slate-800 hover:text-white transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Đang gửi link...
                  </span>
                ) : (
                  'Gửi Magic Link'
                )}
              </Button>

              {/* Magic Link Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">
                    Magic Link - Không cần mật khẩu
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Nhấn vào link chúng tôi gửi qua email để {mode === 'login' ? 'đăng nhập' : 'đăng ký'} an toàn.
                    Link chỉ sử dụng được 1 lần và hết hạn sau 1 giờ.
                  </p>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-6 rounded-lg border-l-4 p-4 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-500'
                : message.type === 'error'
                ? 'bg-rose-50 border-rose-500'
                : 'bg-blue-50 border-blue-500'
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${
              message.type === 'success'
                ? 'text-emerald-900'
                : message.type === 'error'
                ? 'text-rose-900'
                : 'text-blue-900'
            }`}>
              {message.type === 'success' && 'Thành công'}
              {message.type === 'error' && 'Lỗi'}
              {message.type === 'info' && 'Thông báo'}
            </p>
            <p className={`text-sm ${
              message.type === 'success'
                ? 'text-emerald-700'
                : message.type === 'error'
                ? 'text-rose-700'
                : 'text-blue-700'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Security Badge */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-xs text-slate-500">
            Bảo mật bởi Supabase Auth • Mã hóa SSL/TLS
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
