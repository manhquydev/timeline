import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { auditLogRepository } from '@/lib/mongodb/repositories'
import { AuditAction } from '@/lib/mongodb/models'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'

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
        // 1. Fetch all user data
        // Note: In a real system, you'd aggregate from all relevant collections
        const posts = await postRepository.findAll({ userId: user.id })
        const logs = await auditLogRepository.getLogsByUser(user.id, 1000)

        const fullData = {
            profile: {
                id: user.id,
                email: user.email,
                metadata: user.user_metadata,
                created_at: user.created_at
            },
            content: {
                posts: posts.map((p: any) => ({
                    id: p.id,
                    caption: p.wish_text,
                    created_at: p.uploaded_at,
                    media_url: p.media_url,
                    thumbnail_url: p.thumbnail_url
                }))
            },
            activity: logs.map(l => ({
                action: l.action,
                timestamp: l.timestamp,
                details: l.details
            }))
        }

        // 2. Log the activity
        await auditLogRepository.log({
            action: AuditAction.DATA_EXPORT,
            userId: user.id,
            actorName: user.email,
            status: 'success',
            details: { format: 'json', itemCount: posts.length }
        })

        return NextResponse.json(fullData, {
            headers: {
                'Content-Disposition': `attachment; filename="timeline-data-${user.id}.json"`,
                'Content-Type': 'application/json'
            }
        })
    } catch (error: any) {
        console.error('Data Export Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
