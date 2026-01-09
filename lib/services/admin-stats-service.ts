import { connectToDatabase } from '@/lib/mongodb/connection'
import { Post, Event } from '@/lib/mongodb/models'

interface StatsData {
  totalEvents: number
  totalPhotos: number
  totalContributors: number
  openEvents: number
  // Trend data (percentage change vs last week)
  eventsTrend?: number
  photosTrend?: number
  contributorsTrend?: number
}

/**
 * Calculate percentage change between two values
 */
function calculateTrend(current: number, previous: number): number | undefined {
  if (previous === 0) return current > 0 ? 100 : undefined
  const change = ((current - previous) / previous) * 100
  return Math.round(change)
}

/**
 * Get admin dashboard statistics with real trend data
 */
export async function getAdminStats(): Promise<StatsData> {
  await connectToDatabase()

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Current stats
  const events = await Event.find({}).lean()
  const totalEvents = events.length
  const totalPhotos = events.reduce((sum: number, e: any) => sum + (e.stats?.total_photos || 0), 0)
  const totalContributors = events.reduce((sum: number, e: any) => sum + (e.stats?.total_contributors || 0), 0)
  const openEvents = events.filter((e: any) => e.status === 'open').length

  // Stats from last week (for trend calculation)
  const postsThisWeek = await Post.countDocuments({
    created_at: { $gte: oneWeekAgo }
  })
  const postsLastWeek = await Post.countDocuments({
    created_at: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
  })

  const eventsThisWeek = await Event.countDocuments({
    created_at: { $gte: oneWeekAgo }
  })
  const eventsLastWeek = await Event.countDocuments({
    created_at: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
  })

  // Calculate unique contributors this week vs last week
  const contributorsThisWeek = await Post.distinct('user_id', {
    created_at: { $gte: oneWeekAgo }
  }).then((ids: any[]) => ids.length)

  const contributorsLastWeek = await Post.distinct('user_id', {
    created_at: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
  }).then((ids: any[]) => ids.length)

  return {
    totalEvents,
    totalPhotos,
    totalContributors,
    openEvents,
    eventsTrend: calculateTrend(eventsThisWeek, eventsLastWeek),
    photosTrend: calculateTrend(postsThisWeek, postsLastWeek),
    contributorsTrend: calculateTrend(contributorsThisWeek, contributorsLastWeek),
  }
}

/**
 * Get pending posts count
 */
export async function getPendingPostsCount(): Promise<number> {
  await connectToDatabase()
  return Post.countDocuments({ status: 'pending' })
}

/**
 * Get recent events for dashboard
 */
export async function getRecentEvents(limit = 5): Promise<any[]> {
  await connectToDatabase()
  return Event.find({})
    .sort({ created_at: -1 })
    .limit(limit)
    .lean()
}
