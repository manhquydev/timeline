'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useBehaviorTracking } from '@/hooks/use-behavior-tracking'

/**
 * Component to track page views automatically
 * Should be included in the root layout
 */
function AnalyticsTrackerContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Initialize behavior tracking (clicks, etc.)
    useBehaviorTracking()

    useEffect(() => {
        const trackPageView = async () => {
            try {
                const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'page_view',
                        page: fullPath,
                        timestamp: new Date().toISOString(),
                    }),
                })
            } catch (error) {
                // Silently fail in production
                if (process.env.NODE_ENV === 'development') {
                    console.error('Failed to track page view:', error)
                }
            }
        }

        trackPageView()
    }, [pathname, searchParams])

    return null
}

export function AnalyticsTracker() {
    return (
        <Suspense fallback={null}>
            <AnalyticsTrackerContent />
        </Suspense>
    )
}
