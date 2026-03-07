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

  // Current stats — query directly from collections (event.stats may be stale)
  const [events, totalPhotos, allContributors] = await Promise.all([
    Event.find({}).lean(),
    Post.countDocuments({ status: 'approved' }),
    Post.distinct('user_name').then((names: any[]) => names.filter((n: any) => n != null && n !== '').length),
  ])
  const totalEvents = events.length
  const totalContributors = allContributors
  const openEvents = events.filter((e: any) => e.status === 'open').length

  // Stats from last week — Post uses 'uploaded_at', not 'created_at'
  const [postsThisWeek, postsLastWeek, eventsThisWeek, eventsLastWeek,
    contributorsThisWeek, contributorsLastWeek] = await Promise.all([
    Post.countDocuments({ uploaded_at: { $gte: oneWeekAgo } }),
    Post.countDocuments({ uploaded_at: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
    Event.countDocuments({ created_at: { $gte: oneWeekAgo } }),
    Event.countDocuments({ created_at: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
    Post.distinct('user_name', { uploaded_at: { $gte: oneWeekAgo } }).then((names: any[]) => names.filter((n: any) => n).length),
    Post.distinct('user_name', { uploaded_at: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }).then((names: any[]) => names.filter((n: any) => n).length),
  ])

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
