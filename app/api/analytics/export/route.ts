import { NextRequest, NextResponse } from 'next/server'
import { analyticsRepository } from '@/lib/mongodb/repositories'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') || 'all'
        const days = parseInt(searchParams.get('days') || '30')

        const now = new Date()
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

        const stats = await analyticsRepository.getSummaryStats(startDate, now)
        const deviceBreakdown = await analyticsRepository.getDeviceBreakdown(startDate, now)
        const topPages = await analyticsRepository.getTopPages(startDate, now, 20)

        // Construct CSV
        let csv = 'Metric,Value,Percentage/Count\n'

        // Summary Stats
        csv += `Total Page Views,${stats.page_view || 0},\n`
        csv += `Total Clicks,${stats.click || 0},\n`
        csv += `Total Uploads,${stats.upload || 0},\n`
        csv += `Total Errors,${stats.error || 0},\n\n`

        // Device Breakdown
        csv += 'Device Category,Total Views,Percentage\n'
        const totalViews = deviceBreakdown.reduce((acc, curr) => acc + curr.value, 0)
        deviceBreakdown.forEach(item => {
            const percentage = totalViews > 0 ? ((item.value / totalViews) * 100).toFixed(2) : 0
            csv += `${item.label},${item.value},${percentage}%\n`
        })
        csv += '\n'

        // Top Pages
        csv += 'Page Path,Views,Unique Users\n'
        topPages.forEach(item => {
            csv += `"${item.page}",${item.views},${item.uniqueUsersCount}\n`
        })

        const filename = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error('Export Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
