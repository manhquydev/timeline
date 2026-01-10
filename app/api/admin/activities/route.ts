import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { Post, Event } from '@/lib/mongodb/models'
import AuditLog, { AuditAction } from '@/lib/mongodb/models/AuditLog'
import { adminLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

interface ActivityItem {
  id: string
  type: 'new_post' | 'user_signup' | 'post_approved' | 'post_rejected' | 'event_created'
  message: string
  user?: { name: string }
  timestamp: Date
  details?: Record<string, any>
}

// Map AuditAction to activity type
const actionTypeMap: Record<string, ActivityItem['type']> = {
  [AuditAction.POST_CREATED]: 'new_post',
  [AuditAction.USER_SIGNUP]: 'user_signup',
  [AuditAction.POST_APPROVED]: 'post_approved',
  [AuditAction.POST_REJECTED]: 'post_rejected',
  [AuditAction.EVENT_CREATED]: 'event_created',
}

function getMessageForAction(action: string, details?: Record<string, any>, actorName?: string): string {
  switch (action) {
    case AuditAction.POST_CREATED:
      return actorName ? `${actorName} đã tải lên ảnh mới` : 'Đã tải lên ảnh mới'
    case AuditAction.USER_SIGNUP:
      return actorName ? `${actorName} đã đăng ký tài khoản` : 'Người dùng mới đăng ký'
    case AuditAction.POST_APPROVED:
      return details?.count ? `Đã duyệt ${details.count} bài đăng` : 'Đã duyệt bài đăng'
    case AuditAction.POST_REJECTED:
      return 'Đã từ chối bài đăng'
    case AuditAction.EVENT_CREATED:
      return details?.eventTitle ? `Tạo sự kiện "${details.eventTitle}"` : 'Tạo sự kiện mới'
    default:
      return 'Hoạt động không xác định'
  }
}

export const GET = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // Filter by activity type
    const skip = (page - 1) * limit

    await connectToDatabase()

    // Try AuditLog first
    const relevantActions = [
      AuditAction.POST_CREATED,
      AuditAction.USER_SIGNUP,
      AuditAction.POST_APPROVED,
      AuditAction.POST_REJECTED,
      AuditAction.EVENT_CREATED,
    ]

    const auditQuery: any = { action: { $in: relevantActions } }
    if (type) {
      // Map type back to action
      const actionForType = Object.entries(actionTypeMap).find(([_, t]) => t === type)?.[0]
      if (actionForType) {
        auditQuery.action = actionForType
      }
    }

    const auditCount = await AuditLog.countDocuments(auditQuery)

    if (auditCount > 0) {
      const logs = await AuditLog.find(auditQuery)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      const activities: ActivityItem[] = logs.map((log: any) => ({
        id: log._id.toString(),
        type: actionTypeMap[log.action] || 'new_post',
        message: getMessageForAction(log.action, log.details, log.actorName),
        user: log.actorName ? { name: log.actorName } : undefined,
        timestamp: log.timestamp,
        details: log.details,
      }))

      return successResponse({
        activities,
        pagination: {
          page,
          limit,
          total: auditCount,
          totalPages: Math.ceil(auditCount / limit),
        },
      })
    }

    // Fallback: Aggregate from Posts and Events
    const activities: ActivityItem[] = []

    // Get approved posts
    if (!type || type === 'post_approved') {
      const approvedPosts = await Post.find({ status: 'approved' })
        .sort({ uploaded_at: -1 })
        .limit(50)
        .lean()

      for (const post of approvedPosts) {
        activities.push({
          id: `approved-${(post as any)._id}`,
          type: 'post_approved',
          message: `Đã duyệt bài đăng`,
          user: (post as any).user_name ? { name: (post as any).user_name } : undefined,
          timestamp: (post as any).uploaded_at,
          details: { postId: (post as any).id, eventId: (post as any).event_id },
        })
      }
    }

    // Get new posts
    if (!type || type === 'new_post') {
      const newPosts = await Post.find({})
        .sort({ uploaded_at: -1 })
        .limit(50)
        .lean()

      for (const post of newPosts) {
        const isDuplicate = activities.some(a => a.id === `approved-${(post as any)._id}`)
        if (!isDuplicate) {
          activities.push({
            id: `newpost-${(post as any)._id}`,
            type: 'new_post',
            message: (post as any).user_name
              ? `${(post as any).user_name} đã tải lên ảnh mới`
              : 'Đã tải lên ảnh mới',
            user: (post as any).user_name ? { name: (post as any).user_name } : undefined,
            timestamp: (post as any).uploaded_at,
            details: { postId: (post as any).id, eventId: (post as any).event_id },
          })
        }
      }
    }

    // Get events
    if (!type || type === 'event_created') {
      const events = await Event.find({})
        .sort({ created_at: -1 })
        .limit(20)
        .lean()

      for (const event of events) {
        activities.push({
          id: `event-${(event as any)._id}`,
          type: 'event_created',
          message: `Tạo sự kiện "${(event as any).title}"`,
          timestamp: (event as any).created_at,
          details: { eventId: (event as any).id, slug: (event as any).slug },
        })
      }
    }

    // Sort and paginate
    const sorted = activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    const total = sorted.length
    const paginated = sorted.slice(skip, skip + limit)

    return successResponse({
      activities: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    adminLogger.error({ err: error }, 'Error fetching activities')
    return errorResponse('Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
