'use client'

import { useEffect } from 'react'
import { useAnalytics } from './use-analytics'

/**
 * Hook for automatic behavioral tracking
 * Listen for clicks on elements with data-track attribute
 */
export function useBehaviorTracking() {
    const { trackEvent } = useAnalytics()

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const trackElement = target.closest('[data-track]')

            if (trackElement) {
                const eventName = trackElement.getAttribute('data-track') || 'click'
                const metadataStr = trackElement.getAttribute('data-track-meta')
                const metricsStr = trackElement.getAttribute('data-track-metrics')

                let metadata = {}
                let metrics = {}

                try {
                    if (metadataStr) metadata = JSON.parse(metadataStr)
                } catch (err) {
                    metadata = { label: metadataStr }
                }

                try {
                    if (metricsStr) metrics = JSON.parse(metricsStr)
                } catch (err) {
                    // If not JSON, maybe it's just a number
                    const val = parseFloat(metricsStr || '')
                    if (!isNaN(val)) metrics = { value: val }
                }

                trackEvent(eventName, { metadata, metrics })
            }
        }

        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [trackEvent])
}
