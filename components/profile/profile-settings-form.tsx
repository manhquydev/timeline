'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, AlertCircle, Info } from 'lucide-react'

interface ProfileSettingsFormProps {
  initialProfile: any
  userEmail: string
}

export function ProfileSettingsForm({ initialProfile, userEmail }: ProfileSettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [displayName, setDisplayName] = useState(initialProfile?.display_name || '')
  const [fullName, setFullName] = useState(initialProfile?.full_name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName || null,
          full_name: fullName || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess(true)

      // Refresh the page data after a short delay
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate what will be displayed
  const getDisplayPreview = () => {
    if (displayName.trim()) return displayName.trim()
    if (fullName.trim()) return fullName.trim()
    return userEmail.split('@')[0]
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Hiển Thị</CardTitle>
          <CardDescription>
            Thông tin này sẽ hiển thị khi bạn đăng ảnh lên sự kiện
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="display_name">
              Biệt Danh / Tên Hiển Thị
              <span className="text-muted-foreground text-sm font-normal ml-2">
                (Ưu tiên cao nhất)
              </span>
            </Label>
            <Input
              id="display_name"
              type="text"
              placeholder="VD: BinhMinh, Sếp Tèo, Tony..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Đây là tên sẽ hiển thị trên tất cả ảnh của bạn. Bạn có thể dùng biệt danh, nickname hoặc bất kỳ tên nào bạn muốn.
            </p>
          </div>

          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Họ Và Tên Thật
              <span className="text-muted-foreground text-sm font-normal ml-2">
                (Dự phòng nếu không có biệt danh)
              </span>
            </Label>
            <Input
              id="full_name"
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Nếu không đặt biệt danh, tên này sẽ được hiển thị.
            </p>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email không thể thay đổi. Phần trước @ sẽ được dùng nếu không có tên nào khác.
            </p>
          </div>

          {/* Preview */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Tên hiển thị của bạn sẽ là:</strong>{' '}
              <span className="font-semibold text-foreground">
                {getDisplayPreview()}
              </span>
            </AlertDescription>
          </Alert>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <Check className="h-4 w-4" />
              <AlertDescription>
                Cập nhật thành công! Tên mới sẽ hiển thị trên các ảnh bạn đăng tiếp theo.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang Lưu...
                </>
              ) : (
                'Lưu Thay Đổi'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
