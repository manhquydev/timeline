'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook to track analytics events from client-side components
 */
export const useAnalytics = () => {
    const pathname = usePathname()

    const trackEvent = useCallback(async (
        type: string,
        data: {
            event_id?: string;
            metadata?: Record<string, any>;
            metrics?: Record<string, any>;
        } = {}
    ) => {
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    page: pathname,
                    ...data,
                    timestamp: new Date().toISOString(),
                }),
            })
        } catch (error) {
            // Silently fail in production to not disrupt user experience
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to track analytics event:', error)
            }
        }
    }, [pathname])

    const trackPageView = useCallback(() => {
        trackEvent('page_view')
    }, [trackEvent])

    return { trackEvent, trackPageView }
}
