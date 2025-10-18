import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Info } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Link Không Khả Dụng</CardTitle>
              <CardDescription>
                Link xác thực đã được sử dụng hoặc hết hạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Tài khoản có thể đã được xác thực</p>
                <p className="text-xs leading-relaxed">
                  Nếu bạn vừa đăng ký, tài khoản của bạn có thể đã được kích hoạt thành công.
                  Hãy thử <span className="font-semibold">đăng nhập</span> để kiểm tra.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Nguyên nhân thường gặp:</p>
            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
              <li>Link đã được click trước đó</li>
              <li>Email bị scan tự động bởi hệ thống bảo mật</li>
              <li>Link đã hết hạn (sau 24 giờ)</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <Button asChild className="w-full h-12 gradient-1 font-semibold">
              <Link href="/login">Thử Đăng Nhập</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12">
              <Link href="/">Về Trang Chủ</Link>
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Vẫn gặp vấn đề?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Đăng ký lại
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
