'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Loader2, Send, CheckCircle, Shield } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
      setMessage({
        type: 'success',
        text: 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư!',
      })
      setEmail('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full border-0 shadow-2xl">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Email đã được gửi!</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn.
            Vui lòng kiểm tra hộp thư (kể cả thư mục spam).
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Link sẽ hết hạn sau 1 giờ
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 shadow-2xl">
      <CardContent className="pt-6">
        <form onSubmit={handleResetPassword} className="space-y-6">
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
              className="h-12 text-base border-2 focus:border-blue-500 transition-colors"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Nhập email bạn đã dùng để đăng ký tài khoản
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang gửi email...
              </>
            ) : (
              <>
                Gửi link đặt lại mật khẩu
                <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {/* Message Display */}
          {message && (
            <div
              className={`text-sm p-4 rounded-xl animate-in slide-in-from-top-2 duration-300 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border-2 border-green-200'
                  : 'bg-red-50 text-red-800 border-2 border-red-200'
              }`}
            >
              <p className="font-semibold mb-1">
                {message.type === 'success' ? '✓ Thành công!' : '✗ Lỗi!'}
              </p>
              <p className="text-xs leading-relaxed">{message.text}</p>
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3 text-xs">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">
                  Cách hoạt động?
                </p>
                <p className="text-blue-800 leading-relaxed">
                  Chúng tôi sẽ gửi một link bảo mật đến email của bạn.
                  Nhấn vào link để đặt mật khẩu mới cho tài khoản.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Security Badge */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Bảo mật bởi Supabase Auth</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
