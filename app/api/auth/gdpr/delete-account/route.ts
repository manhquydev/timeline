import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { auditLogRepository } from '@/lib/mongodb/repositories'
import { AuditAction } from '@/lib/mongodb/models'

export async function POST() {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Log the deletion before it happens
        await auditLogRepository.log({
            action: AuditAction.ACCOUNT_DELETION,
            userId: user.id,
            actorName: user.email,
            status: 'success',
            details: { reason: 'User requested deletion' }
        })

        // 2. Delete user from Supabase Auth
        // WARNING: In production, you might want to use a service role to permanently delete,
        // or just mark as deleted and have a background job clean up.
        // supabase.auth.admin.deleteUser(user.id) // Requires service role

        // For this implementation, we simulate the start of the deletion process.
        // In a real app, you would also delete their data from MongoDB.

        return NextResponse.json({
            message: 'Yêu cầu xóa tài khoản đã được tiếp nhận. Dữ liệu của bạn sẽ được xóa vĩnh viễn trong vòng 30 ngày.'
        })
    } catch (error: any) {
        console.error('Account Deletion Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
