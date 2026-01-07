import mongoose, { Schema, Document } from 'mongoose'

export enum AuditAction {
    // Auth events
    LOGIN_SUCCESS = 'login_success',
    LOGIN_FAILURE = 'login_failure',
    LOGOUT = 'logout',
    MFA_ENROLLED = 'mfa_enrolled',
    MFA_DISABLED = 'mfa_disabled',
    PASSWORD_CHANGE = 'password_change',

    // Data events
    DATA_EXPORT = 'data_export',
    ACCOUNT_DELETION = 'account_deletion',
    POST_DELETE = 'post_delete',
    EVENT_DELETE = 'event_delete',

    // Admin events
    ADMIN_ACCESS = 'admin_access',
    SETTINGS_CHANGE = 'settings_change',
    SYSTEM_ALERT = 'system_alert'
}

export interface IAuditLog {
    action: AuditAction
    userId?: string
    actorName?: string
    ipAddress?: string
    userAgent?: string
    resourceId?: string
    resourceType?: string
    status: 'success' | 'failure'
    details?: Record<string, any>
    timestamp: Date
}

export interface IAuditLogDocument extends IAuditLog, Document { }

const AuditLogSchema = new Schema<IAuditLogDocument>({
    action: { type: String, enum: Object.values(AuditAction), required: true },
    userId: { type: String, index: true },
    actorName: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    resourceId: { type: String, index: true },
    resourceType: { type: String },
    status: { type: String, enum: ['success', 'failure'], required: true },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true }
})

// Compound index for user activity timeline
AuditLogSchema.index({ userId: 1, timestamp: -1 })

export default mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema)
