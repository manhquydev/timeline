'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Smartphone, Key, AlertCircle, CheckCircle2, QrCode, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MFAFactor {
    id: string
    status: 'verified' | 'unverified'
    friendly_name?: string
    factor_type: 'totp'
}

export function SecuritySettingsClient() {
    const [factors, setFactors] = useState<MFAFactor[]>([])
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [enrollData, setEnrollData] = useState<any>(null)
    const [verificationCode, setVerificationCode] = useState('')
    const [verifying, setVerifying] = useState(false)
    const { toast } = useToast()

    const fetchFactors = async () => {
        try {
            const res = await fetch('/api/auth/mfa/factors')
            const data = await res.json()
            if (data.all) {
                setFactors(data.all)
            }
        } catch (err) {
            console.error('Error fetching factors:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFactors()
    }, [])

    const startEnrollment = async () => {
        setEnrolling(true)
        try {
            const res = await fetch('/api/auth/mfa/enroll', { method: 'POST' })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setEnrollData(data)
        } catch (err: any) {
            toast({
                title: 'Lỗi',
                description: err.message,
                variant: 'destructive'
            })
        } finally {
            setEnrolling(false)
        }
    }

    const verifyEnrollment = async () => {
        if (!verificationCode || verificationCode.length !== 6) return
        setVerifying(true)
        try {
            const res = await fetch('/api/auth/mfa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    factorId: enrollData.id,
                    code: verificationCode
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            toast({
                title: 'Thành công',
                description: 'Đã kích hoạt xác thực 2 lớp!',
            })

            setEnrollData(null)
            setVerificationCode('')
            fetchFactors()
        } catch (err: any) {
            toast({
                title: 'Lỗi xác thực',
                description: err.message,
                variant: 'destructive'
            })
        } finally {
            setVerifying(false)
        }
    }

    const isMFAEnabled = factors.some(f => f.status === 'verified')

    return (
        <div className="space-y-6">
            <Card className="border-primary/10 bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Xác thực 2 lớp (MFA)</CardTitle>
                            <CardDescription>
                                Bảo vệ tài khoản của bạn bằng mã bảo mật từ ứng dụng Authenticator.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-20 flex items-center justify-center">
                            <div className="spinner" />
                        </div>
                    ) : isMFAEnabled ? (
                        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-emerald-500/20">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                <div>
                                    <p className="font-bold">MFA đang hoạt động</p>
                                    <p className="text-sm text-muted-foreground">Tài khoản của bạn đang được bảo vệ.</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
                                Đã xác minh
                            </Badge>
                        </div>
                    ) : enrollData ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border">
                                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={enrollData.totp.qr_code}
                                        alt="MFA QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="text-sm font-medium mb-1">Quét mã QR bằng ứng dụng của bạn</p>
                                <p className="text-xs text-muted-foreground text-center max-w-[240px]">
                                    Sử dụng Google Authenticator, Authy hoặc ứng dụng xác thực khác.
                                </p>
                                <div className="mt-4 p-3 bg-muted rounded-lg w-full">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Hoặc nhập mã thủ công:</p>
                                    <code className="text-sm break-all">{enrollData.totp.secret}</code>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold">Nhập mã 6 số để xác nhận</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 text-center text-xl tracking-[0.5em] font-mono"
                                    />
                                    <Button
                                        onClick={verifyEnrollment}
                                        disabled={verifying || verificationCode.length !== 6}
                                        className="px-8 font-bold"
                                    >
                                        {verifying ? 'Đang xác thực...' : 'Kích hoạt'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                <Smartphone className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <Button
                                onClick={startEnrollment}
                                className="gradient-1 font-bold shadow-lg hover-lift px-8"
                                disabled={enrolling}
                            >
                                {enrolling ? 'Đang chuẩn bị...' : 'Bắt đầu thiết lập'}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-4 italic">
                                Khuyến nghị để tăng cường bảo mật tối đa.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-destructive/10">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                            <CardTitle>Quyền riêng tư & Dữ liệu</CardTitle>
                            <CardDescription>
                                Quản lý dữ liệu cá nhân theo quy định GDPR.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                        <div>
                            <p className="font-bold text-sm">Xuất dữ liệu</p>
                            <p className="text-xs text-muted-foreground">Tải xuống toàn bộ tệp JSON chứa các bài đăng và hoạt động của bạn.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={async () => {
                            const res = await fetch('/api/auth/gdpr/export', { method: 'POST' })
                            const blob = await res.blob()
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `timeline-data.json`
                            a.click()
                        }}>
                            Tải JSON
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-xl hover:bg-destructive/5 transition-colors">
                        <div>
                            <p className="font-bold text-sm text-destructive">Xóa tài khoản</p>
                            <p className="text-xs text-muted-foreground">Xóa vĩnh viễn mọi dữ liệu và ảnh của bạn. Hành động này không thể hoàn tác.</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={async () => {
                            if (confirm('Bạn có chắc chắn muốn xóa tài khoản?')) {
                                const res = await fetch('/api/auth/gdpr/delete-account', { method: 'POST' })
                                const data = await res.json()
                                alert(data.message || data.error)
                            }
                        }}>
                            Xóa vĩnh viễn
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
