'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Upload page error:', error)
    }, [error])

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6 text-red-600 dark:text-red-400 animate-in zoom-in duration-300">
                <AlertTriangle className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-bold mb-3">Đã xảy ra sự cố!</h2>

            <p className="text-muted-foreground max-w-md mb-8">
                Hệ thống gặp lỗi khi tải trang này. Đây có thể là lỗi tạm thời hoặc do xung đột với tiện ích mở rộng trình duyệt.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={reset}
                    className="gradient-1 hover-lift shadow-lg"
                    size="lg"
                >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Thử lại
                </Button>

                <Link href="/">
                    <Button variant="outline" size="lg" className="w-full">
                        <Home className="w-5 h-5 mr-2" />
                        Về Trang Chủ
                    </Button>
                </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-8 opacity-60">
                Mã lỗi: {error.digest || 'REACT_RUNTIME_ERROR'}
            </p>
        </div>
    )
}
