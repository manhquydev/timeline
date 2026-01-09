import { connectToDatabase } from '@/lib/mongodb/connection'
import AuditLog, { AuditAction } from '@/lib/mongodb/models/AuditLog'
import { Post, Event } from '@/lib/mongodb/models'

export interface ActivityItem {
  id: string
  type: 'new_post' | 'user_signup' | 'post_approved' | 'post_rejected' | 'event_created'
  message: string
  user?: { name: string }
  timestamp: Date
}

// Map AuditAction to activity type
const actionTypeMap: Record<string, ActivityItem['type']> = {
  [AuditAction.POST_CREATED]: 'new_post',
  [AuditAction.USER_SIGNUP]: 'user_signup',
  [AuditAction.POST_APPROVED]: 'post_approved',
  [AuditAction.POST_REJECTED]: 'post_rejected',
  [AuditAction.EVENT_CREATED]: 'event_created',
}

// Vietnamese message templates
const messageTemplates: Record<ActivityItem['type'], (details?: Record<string, any>) => string> = {
  new_post: (d) => d?.count ? `Đã tải lên ${d.count} ảnh mới` : 'Đã tải lên ảnh mới',
  user_signup: () => 'Người dùng mới đăng ký',
  post_approved: (d) => d?.count ? `Đã duyệt ${d.count} bài đăng` : 'Đã duyệt bài đăng',
  post_rejected: () => 'Đã từ chối bài đăng',
  event_created: (d) => d?.eventTitle ? `Tạo sự kiện "${d.eventTitle}"` : 'Tạo sự kiện mới',
}

/**
 * Fetch recent activities from AuditLog
 */
export async function getRecentActivities(limit = 10): Promise<ActivityItem[]> {
  await connectToDatabase()

  const relevantActions = [
    AuditAction.POST_CREATED,
    AuditAction.USER_SIGNUP,
    AuditAction.POST_APPROVED,
    AuditAction.POST_REJECTED,
    AuditAction.EVENT_CREATED,
  ]

  const logs = await AuditLog.find({ action: { $in: relevantActions } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean()

  return logs.map((log: any) => {
    const type = actionTypeMap[log.action] || 'new_post'
    return {
      id: log._id.toString(),
      type,
      message: messageTemplates[type](log.details),
      user: log.actorName ? { name: log.actorName } : undefined,
      timestamp: log.timestamp,
    }
  })
}

/**
 * Fetch activities from real data (Posts, Events) when AuditLog is empty
 * Fallback method that aggregates from actual data sources
 */
export async function getRecentActivitiesFromData(limit = 10): Promise<ActivityItem[]> {
  await connectToDatabase()

  const activities: ActivityItem[] = []

  // Get recent approved posts
  const recentPosts = await Post.find({ status: 'approved' })
    .sort({ approved_at: -1 })
    .limit(5)
    .lean()

  for (const post of recentPosts) {
    activities.push({
      id: `post-${(post as any)._id}`,
      type: 'post_approved',
      message: `Đã duyệt bài đăng`,
      user: (post as any).user_name ? { name: (post as any).user_name } : undefined,
      timestamp: (post as any).approved_at || (post as any).created_at,
    })
  }

  // Get recent created posts
  const newPosts = await Post.find({})
    .sort({ created_at: -1 })
    .limit(5)
    .lean()

  for (const post of newPosts) {
    activities.push({
      id: `newpost-${(post as any)._id}`,
      type: 'new_post',
      message: 'Đã tải lên ảnh mới',
      user: (post as any).user_name ? { name: (post as any).user_name } : undefined,
      timestamp: (post as any).created_at,
    })
  }

  // Get recent events
  const recentEvents = await Event.find({})
    .sort({ created_at: -1 })
    .limit(3)
    .lean()

  for (const event of recentEvents) {
    activities.push({
      id: `event-${(event as any)._id}`,
      type: 'event_created',
      message: `Tạo sự kiện "${(event as any).title}"`,
      timestamp: (event as any).created_at,
    })
  }

  // Sort by timestamp and limit
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

/**
 * Main function: Try AuditLog first, fallback to real data
 */
export async function fetchRecentActivities(limit = 10): Promise<ActivityItem[]> {
  const auditActivities = await getRecentActivities(limit)

  if (auditActivities.length > 0) {
    return auditActivities
  }

  // Fallback to aggregating from real data
  return getRecentActivitiesFromData(limit)
}

/**
 * Log an activity to AuditLog
 */
export async function logActivity(
  action: AuditAction,
  options: {
    userId?: string
    actorName?: string
    resourceId?: string
    resourceType?: string
    details?: Record<string, any>
  } = {}
): Promise<void> {
  await connectToDatabase()

  await AuditLog.create({
    action,
    userId: options.userId,
    actorName: options.actorName,
    resourceId: options.resourceId,
    resourceType: options.resourceType,
    details: options.details,
    status: 'success',
    timestamp: new Date(),
  })
}
