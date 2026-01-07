import { NextRequest, NextResponse } from 'next/server'
import { analyticsRepository } from '@/lib/mongodb/repositories'
import { createClient } from '@/lib/supabase/server'

/**
 * API route to track analytics events from the client
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type, page, event_id, metadata, metrics, timestamp } = body

        if (!type || !page) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Try to get user from session if authenticated
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Get client info from headers
        const ua = req.headers.get('user-agent') || ''

        // Basic device detection
        let device: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown'
        if (/mobile/i.test(ua)) device = 'mobile'
        else if (/tablet/i.test(ua)) device = 'tablet'
        else if (/ipad|android/i.test(ua)) device = 'tablet'
        else if (/msie|trident|edge|chrome|safari|firefox|opera/i.test(ua)) device = 'desktop'

        await analyticsRepository.track({
            type,
            page,
            event_id: event_id || null,
            user_id: user?.id || null,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            metadata: {
                ...metadata,
            },
            metrics: metrics || {},
            device,
            browser: ua,
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Analytics tracking error:', error)
        return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }
}
