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

        const stats = await analyticsRepository.find({ timestamp: { $gte: startDate, $lte: now } }) as any[]
        const deviceBreakdown = await analyticsRepository.getDeviceBreakdown(startDate, now)
        const topPages = await analyticsRepository.getTopPages(startDate, now, 20)

        // Construct CSV
        let csv = 'Metric,Value,Percentage/Count\n'

        // Summary Stats
        const pageViewCount = (stats as any[]).find(s => s.type === 'page_view')?.count || 0
        const clickCount = (stats as any[]).find(s => s.type === 'click')?.count || 0
        const uploadCount = (stats as any[]).find(s => s.type === 'upload')?.count || 0
        const errorCount = (stats as any[]).find(s => s.type === 'error')?.count || 0

        csv += `Total Page Views,${pageViewCount},\n`
        csv += `Total Clicks,${clickCount},\n`
        csv += `Total Uploads,${uploadCount},\n`
        csv += `Total Errors,${errorCount},\n\n`

        // Device Breakdown
        csv += 'Device Category,Total Views,Percentage\n'
        const totalViews = (deviceBreakdown as any[]).reduce((acc: number, curr: any) => acc + curr.count, 0)
            ; (deviceBreakdown as any[]).forEach((item: any) => {
                const label = item._id || 'Unknown'
                const value = item.count || 0
                const percentage = totalViews > 0 ? ((value / totalViews) * 100).toFixed(2) : 0
                csv += `${label},${value},${percentage}%\n`
            })
        csv += '\n'

        // Top Pages
        csv += 'Page Path,Views,Unique Users\n'
            ; (topPages as any[]).forEach((item: any) => {
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
