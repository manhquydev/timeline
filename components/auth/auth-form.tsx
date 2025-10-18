'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
    <Card className="w-full border-0 shadow-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">
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
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Chúng tôi sẽ gửi đường link bảo mật để đăng nhập
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base gradient-1 hover-lift hover-glow ripple font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner mr-2 !w-4 !h-4 !border-2" />
                Đang gửi link...
              </>
            ) : (
              'Gửi Link Đăng Nhập'
            )}
          </Button>

          {message && (
            <div
              className={`text-sm p-4 rounded-xl animate-scale-in ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <p className="font-medium mb-1">
                {message.type === 'success' ? '✓ Kiểm tra email!' : '✗ Lỗi!'}
              </p>
              <p className="text-xs">{message.text}</p>
            </div>
          )}
        </form>

        {/* Security note */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-start gap-3 text-xs text-muted-foreground">
            <div className="w-5 h-5 rounded-full gradient-2 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-[10px] font-bold">?</span>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Cách hoạt động?</p>
              <p>
                Nhấn vào đường link chúng tôi gửi qua email để đăng nhập an toàn. Không cần mật khẩu!
                Link sẽ hết hạn sau 1 giờ để bảo mật.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
