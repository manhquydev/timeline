'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

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
      <Card className="w-full border shadow-sm">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-500">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-900">Email đã được gửi</h3>
          <p className="text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
            Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn.
            Vui lòng kiểm tra hộp thư (kể cả thư mục spam).
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-900 font-medium">
              Link sẽ hết hạn sau 1 giờ
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-8 pb-8 px-8">
        <form onSubmit={handleResetPassword} className="space-y-6">
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
              className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
              autoFocus
            />
            <p className="text-xs text-slate-500">
              Nhập email bạn đã dùng để đăng ký tài khoản
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 font-medium bg-slate-900 hover:bg-slate-800 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Đang gửi email...
              </span>
            ) : (
              'Gửi link đặt lại mật khẩu'
            )}
          </Button>

          {/* Message Display */}
          {message && (
            <div
              className={`rounded-lg border-l-4 p-4 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-rose-50 border-rose-500'
              }`}
            >
              <p className={`text-sm font-medium mb-1 ${
                message.type === 'success' ? 'text-emerald-900' : 'text-rose-900'
              }`}>
                {message.type === 'success' ? 'Thành công' : 'Lỗi'}
              </p>
              <p className={`text-sm ${
                message.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Info box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">
                Cách hoạt động?
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chúng tôi sẽ gửi một link bảo mật đến email của bạn.
                Nhấn vào link để đặt mật khẩu mới cho tài khoản.
              </p>
            </div>
          </div>
        </form>

        {/* Security Badge */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-xs text-slate-500">
            Bảo mật bởi Supabase Auth
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
