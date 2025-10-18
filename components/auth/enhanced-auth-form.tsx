'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Lock, ArrowRight, Loader2, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type AuthMode = 'login' | 'signup'

export function EnhancedAuthForm({ mode: initialMode = 'login' }: { mode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [authMethod, setAuthMethod] = useState<'password' | 'magiclink'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

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
    <Card className="w-full border-0 shadow-2xl">
      <CardContent className="pt-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Auth Method Tabs */}
        <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Mật khẩu
            </TabsTrigger>
            <TabsTrigger value="magiclink" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Magic Link
            </TabsTrigger>
          </TabsList>

          {/* Password Auth */}
          <TabsContent value="password" className="space-y-0">
            <form onSubmit={handlePasswordAuth} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Địa chỉ email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 text-base border-2 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-500" />
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 text-base border-2 focus:border-purple-500 transition-colors"
                />
                {mode === 'signup' && (
                  <p className="text-xs text-muted-foreground">
                    Tối thiểu 6 ký tự
                  </p>
                )}
              </div>

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Xác nhận mật khẩu
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 text-base border-2 focus:border-green-500 transition-colors"
                  />
                </div>
              )}

              {/* Forgot Password Link (Login only) */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
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
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Info text for signup */}
              {mode === 'signup' && (
                <p className="text-xs text-center text-muted-foreground">
                  Bằng cách đăng ký, bạn đồng ý với{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </Link>
                </p>
              )}
            </form>
          </TabsContent>

          {/* Magic Link Auth */}
          <TabsContent value="magiclink" className="space-y-0">
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="magiclink-email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Địa chỉ email
                </Label>
                <Input
                  id="magiclink-email"
                  type="email"
                  placeholder="email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 text-base border-2 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-muted-foreground flex items-start gap-2">
                  <Zap className="w-3 h-3 mt-0.5 text-yellow-500" />
                  Chúng tôi sẽ gửi link bảo mật để {mode === 'login' ? 'đăng nhập' : 'đăng ký'}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang gửi link...
                  </>
                ) : (
                  <>
                    Gửi Magic Link
                    <Zap className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Magic Link Info */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3 text-xs">
                  <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900 mb-1">
                      Magic Link - Không cần mật khẩu
                    </p>
                    <p className="text-orange-800">
                      Nhấn vào link chúng tôi gửi qua email để {mode === 'login' ? 'đăng nhập' : 'đăng ký'} an toàn.
                      Link chỉ sử dụng được 1 lần và hết hạn sau 1 giờ.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-5 text-sm p-4 rounded-xl animate-in slide-in-from-top-2 duration-300 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border-2 border-green-200'
                : message.type === 'error'
                ? 'bg-red-50 text-red-800 border-2 border-red-200'
                : 'bg-blue-50 text-blue-800 border-2 border-blue-200'
            }`}
          >
            <p className="font-semibold mb-1 flex items-center gap-2">
              {message.type === 'success' && '✓ Thành công!'}
              {message.type === 'error' && '✗ Lỗi!'}
              {message.type === 'info' && 'ℹ️ Thông báo'}
            </p>
            <p className="text-xs leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* Security Badge */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Bảo mật bởi Supabase Auth • Mã hóa SSL/TLS</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
