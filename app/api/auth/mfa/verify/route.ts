import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { auditLogRepository } from '@/lib/mongodb/repositories/AuditLogRepository'
import { AuditAction } from '@/lib/mongodb/models'

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const { factorId, code } = await request.json()

    if (!factorId || !code) {
        return NextResponse.json({ error: 'Missing factorId or code' }, { status: 400 })
    }

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
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code
        })

        if (error) {
            throw error
        }

        await auditLogRepository.log({
            action: AuditAction.MFA_ENROLLED, // Using ENROLLED for final confirmation
            userId: user.id,
            actorName: user.email,
            status: 'success',
            details: { factorId, step: 'verification_success' }
        })

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('MFA Verify Error:', error)

        await auditLogRepository.log({
            action: AuditAction.MFA_ENROLLED,
            userId: user.id,
            actorName: user.email,
            status: 'failure',
            details: { factorId, error: error.message }
        })

        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
