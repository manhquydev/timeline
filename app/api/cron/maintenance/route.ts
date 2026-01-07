import { NextResponse } from 'next/server'
import { postRepository, auditLogRepository, eventRepository } from '@/lib/mongodb/repositories'
import { AuditAction } from '@/lib/mongodb/models'

/**
 * SECURE CRON ENDPOINT
 * This endpoint should be triggered by a scheduled task (e.g., Vercel Cron, GitHub Actions)
 * Protected by an API key header.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const apiKey = request.headers.get('x-cron-api-key') || searchParams.get('key')

    if (apiKey !== process.env.CRON_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const results = []

        // 1. Mark past events as 'completed'
        const now = new Date()
        const { modifiedCount } = await eventRepository.updateMany(
            { endDate: { $lt: now }, status: { $ne: 'completed' } },
            { status: 'completed' }
        )
        if (modifiedCount > 0) {
            results.push(`Archived ${modifiedCount} past events.`)
        }

        // 2. Perform automated audit logging of the maintenance task
        await auditLogRepository.log({
            action: AuditAction.SYSTEM_ALERT,
            userId: 'system',
            actorName: 'Cron Bot',
            status: 'success',
            details: { task: 'daily_maintenance', results }
        })

        return NextResponse.json({ success: true, results })
    } catch (error: any) {
        console.error('Maintenance Cron Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
