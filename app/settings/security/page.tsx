import { SecuritySettingsClient } from '@/components/settings/security-settings-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { History, ShieldAlert } from 'lucide-react'
import { auditLogRepository } from '@/lib/mongodb/repositories'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export default async function SecurityPage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch recent security logs for this user
    const logs = user ? await auditLogRepository.getLogsByUser(user.id, 5) : []

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Bảo mật & Quyền riêng tư</h1>
                <p className="text-muted-foreground mt-2">
                    Quản lý các thiết lập bảo mật và dữ liệu cá nhân của bạn.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <SecuritySettingsClient />
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-bold">Hoạt động gần đây</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.length > 0 ? logs.map((log: any) => (
                                    <div key={log._id.toString()} className="flex gap-3 text-xs">
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground capitalize truncate">{log.action.replace('_', ' ')}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(log.timestamp, { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground italic">Chưa có hoạt động nào được ghi lại.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader className="pb-3 text-amber-700 dark:text-amber-400">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" />
                                <CardTitle className="text-sm font-bold">Lưu ý bảo mật</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2 text-amber-600/80 dark:text-amber-500/80">
                            <p>• Không bao giờ chia sẻ mã MFA hoặc mật khẩu của bạn.</p>
                            <p>• Đảm bảo bạn đã lưu mã khôi phục nếu có.</p>
                            <p>• Đăng xuất sau khi sử dụng trên các thiết bị công cộng.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
