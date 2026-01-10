/**
 * Audit logging service for persisting admin actions to MongoDB.
 * Used to track all administrative changes for compliance and debugging.
 */

import { auditLogRepository } from '@/lib/mongodb/repositories'
import { AuditAction, IAuditLog } from '@/lib/mongodb/models/AuditLog'
import { NextRequest } from 'next/server'

// Re-export AuditAction for convenience
export { AuditAction }

/**
 * Extract client info from request headers
 */
export function getClientInfo(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1',
    userAgent: request.headers.get('user-agent') || 'unknown'
  }
}

interface AuditLogInput {
  action: AuditAction
  userId?: string
  actorName?: string
  resourceId?: string
  resourceType?: string
  status: 'success' | 'failure'
  details?: Record<string, any>
}

/**
 * Log an audit event to MongoDB
 * Never throws - audit logging should not break main flow
 */
export async function logAudit(
  input: AuditLogInput,
  request?: NextRequest
): Promise<void> {
  try {
    const clientInfo = request ? getClientInfo(request) : {}

    await auditLogRepository.log({
      ...input,
      ...clientInfo,
    })
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    console.error('[AuditService] Failed to log audit event:', error)
  }
}

/**
 * Helper for logging admin actions with common pattern
 */
export async function logAdminAction(
  request: NextRequest,
  action: AuditAction,
  details: {
    adminUserId: string
    adminEmail: string
    resourceId?: string
    resourceType?: string
    changes?: { before?: any; after?: any }
    metadata?: Record<string, any>
  }
): Promise<void> {
  await logAudit({
    action,
    userId: details.adminUserId,
    actorName: details.adminEmail,
    resourceId: details.resourceId,
    resourceType: details.resourceType,
    status: 'success',
    details: {
      ...details.changes,
      ...details.metadata,
    }
  }, request)
}

/**
 * Helper for logging failed admin actions
 */
export async function logAdminActionFailure(
  request: NextRequest,
  action: AuditAction,
  details: {
    adminUserId?: string
    adminEmail?: string
    resourceId?: string
    resourceType?: string
    error: string
  }
): Promise<void> {
  await logAudit({
    action,
    userId: details.adminUserId,
    actorName: details.adminEmail,
    resourceId: details.resourceId,
    resourceType: details.resourceType,
    status: 'failure',
    details: { error: details.error }
  }, request)
}

/**
 * Log user role change
 */
export async function logRoleChange(
  request: NextRequest,
  adminUser: { id: string; email: string },
  targetUserId: string,
  fromRole: string,
  toRole: string
): Promise<void> {
  await logAdminAction(request, AuditAction.SETTINGS_CHANGE, {
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    resourceId: targetUserId,
    resourceType: 'User',
    changes: {
      before: { role: fromRole },
      after: { role: toRole }
    },
    metadata: { actionType: 'ROLE_CHANGE' }
  })
}

/**
 * Log user deletion
 */
export async function logUserDeletion(
  request: NextRequest,
  adminUser: { id: string; email: string },
  deletedUserId: string,
  deletedUserEmail?: string
): Promise<void> {
  await logAdminAction(request, AuditAction.ACCOUNT_DELETION, {
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    resourceId: deletedUserId,
    resourceType: 'User',
    changes: {
      before: { email: deletedUserEmail, exists: true },
      after: { exists: false }
    }
  })
}

/**
 * Log event creation
 */
export async function logEventCreation(
  request: NextRequest,
  adminUser: { id: string; email: string },
  event: { id: string; title: string; slug: string }
): Promise<void> {
  await logAdminAction(request, AuditAction.EVENT_CREATED, {
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    resourceId: event.id,
    resourceType: 'Event',
    changes: {
      after: { title: event.title, slug: event.slug }
    }
  })
}

/**
 * Log event deletion
 */
export async function logEventDeletion(
  request: NextRequest,
  adminUser: { id: string; email: string },
  eventId: string,
  eventTitle?: string
): Promise<void> {
  await logAdminAction(request, AuditAction.EVENT_DELETE, {
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    resourceId: eventId,
    resourceType: 'Event',
    changes: {
      before: { title: eventTitle, exists: true },
      after: { exists: false }
    }
  })
}

/**
 * Log post approval/rejection
 */
export async function logPostModeration(
  request: NextRequest,
  adminUser: { id: string; email: string },
  postId: string,
  fromStatus: string,
  toStatus: string
): Promise<void> {
  const action = toStatus === 'approved'
    ? AuditAction.POST_APPROVED
    : AuditAction.POST_REJECTED

  await logAdminAction(request, action, {
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    resourceId: postId,
    resourceType: 'Post',
    changes: {
      before: { status: fromStatus },
      after: { status: toStatus }
    }
  })
}

/**
 * Log post deletion
 */
export async function logPostDeletion(
  request: NextRequest,
  adminUser: { id: string; email: string },
  postId: string,
  postStatus?: string
): Promise<void> {
  await logAdminAction(request, AuditAction.POST_DELETE, {
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    resourceId: postId,
    resourceType: 'Post',
    changes: {
      before: { status: postStatus, exists: true },
      after: { exists: false }
    }
  })
}
