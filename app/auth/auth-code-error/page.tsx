import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lỗi Xác Thực</CardTitle>
          <CardDescription>
            Đã xảy ra lỗi khi xử lý yêu cầu xác thực của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Đường link có thể đã hết hạn hoặc đã được sử dụng. Vui lòng thử đăng nhập lại.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Về Trang Chủ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
