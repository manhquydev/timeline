import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { auditLogRepository } from '@/lib/mongodb/repositories/AuditLogRepository'
import { AuditAction } from '@/lib/mongodb/models'

export async function POST(request: Request) {
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
        // 1. Enroll user in MFA
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            issuer: 'Timeline',
            friendlyName: user.email?.split('@')[0] || 'User'
        })

        if (error) {
            throw error
        }

        // 2. Log the intent
        await auditLogRepository.log({
            action: AuditAction.MFA_ENROLLED,
            userId: user.id,
            actorName: user.email,
            status: 'success',
            details: { factorId: data.id, step: 'enroll_initiated' }
        })

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('MFA Enroll Error:', error)

        await auditLogRepository.log({
            action: AuditAction.MFA_ENROLLED,
            userId: user.id,
            actorName: user.email,
            status: 'failure',
            details: { error: error.message }
        })

        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
