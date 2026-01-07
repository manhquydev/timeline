import Analytics, { IAnalytics, IAnalyticsDocument } from '../models/Analytics'
import { BaseRepository } from './BaseRepository'

/**
 * Analytics Repository
 * Handles tracking and reporting of analytics events
 */
export class AnalyticsRepository extends BaseRepository<IAnalyticsDocument, IAnalytics> {
    constructor() {
        super(Analytics)
    }

    /**
     * Track a new analytics event
     */
    async track(data: Partial<IAnalytics>): Promise<IAnalyticsDocument> {
        return this.create(data as any)
    }

    /**
     * Get summary stats for a date range
     */
    async getSummaryStats(startDate: Date, endDate: Date, eventId?: string) {
        await this.ensureConnection()

        const match: any = {
            timestamp: { $gte: startDate, $lte: endDate }
        }

        if (eventId) {
            match.event_id = eventId
        }

        return await (this.model as any).aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: { $ifNull: ['$metrics.count', 1] } },
                    totalValue: { $sum: { $ifNull: ['$metrics.value', 0] } },
                    avgDuration: { $avg: { $ifNull: ['$metrics.duration', 0] } },
                    uniqueUsers: { $addToSet: '$user_id' }
                }
            },
            {
                $project: {
                    type: '$_id',
                    count: 1,
                    totalValue: 1,
                    avgDuration: 1,
                    uniqueUsersCount: { $size: '$uniqueUsers' }
                }
            }
        ])
    }

    /**
     * Get activity trends over time
     */
    async getTrends(startDate: Date, endDate: Date, type: string = 'page_view', interval: 'day' | 'hour' = 'day') {
        await this.ensureConnection()

        const format = interval === 'day' ? '%Y-%m-%d' : '%Y-%m-%d %H:00'

        return await (this.model as any).aggregate([
            {
                $match: {
                    type: type,
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format, date: '$timestamp' } },
                    count: { $sum: { $ifNull: ['$metrics.count', 1] } }
                }
            },
            { $sort: { _id: 1 } }
        ])
    }

    /**
     * Get device breakdown
     */
    async getDeviceBreakdown(startDate: Date, endDate: Date, eventId?: string) {
        await this.ensureConnection()

        const match: any = {
            timestamp: { $gte: startDate, $lte: endDate }
        }

        if (eventId) {
            match.event_id = eventId
        }

        return await (this.model as any).aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$device',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ])
    }

    /**
     * Get top pages
     */
    async getTopPages(startDate: Date, endDate: Date, limit: number = 10) {
        await this.ensureConnection()

        return await (this.model as any).aggregate([
            {
                $match: {
                    type: 'page_view',
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$page',
                    views: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$user_id' }
                }
            },
            {
                $project: {
                    page: '$_id',
                    views: 1,
                    uniqueUsersCount: { $size: '$uniqueUsers' }
                }
            },
            { $sort: { views: -1 } },
            { $limit: limit }
        ])
    }

    /**
     * Get funnel statistics
     * Calculates conversion across a defined set of steps
     */
    async getFunnelStats(startDate: Date, endDate: Date, steps: string[]) {
        await this.ensureConnection()

        const funnelResults: any[] = []

        for (let i = 0; i < steps.length; i++) {
            const stepName = steps[i]

            // Count unique users who reached this step
            const result: any[] = await (this.model as any).aggregate([
                {
                    $match: {
                        type: stepName,
                        timestamp: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        uniqueUsers: { $addToSet: '$user_id' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        count: 1,
                        uniqueUsersCount: { $size: '$uniqueUsers' }
                    }
                }
            ])

            const data = result[0] || { count: 0, uniqueUsersCount: 0 }
            funnelResults.push({
                step: stepName,
                ...data
            })
        }

        // Calculate conversion rates
        return funnelResults.map((step, index) => {
            const prevStep = funnelResults[index - 1]
            const dropOff = prevStep ? Math.max(0, prevStep.uniqueUsersCount - step.uniqueUsersCount) : 0
            const conversionRate = prevStep && prevStep.uniqueUsersCount > 0
                ? (step.uniqueUsersCount / prevStep.uniqueUsersCount) * 100
                : 100

            return {
                ...step,
                dropOff,
                conversionRate: conversionRate.toFixed(2)
            }
        })
    }
}

export const analyticsRepository = new AnalyticsRepository()
