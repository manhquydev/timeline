import { AuditLog, IAuditLog, AuditAction, IAuditLogDocument } from '../models'
import { BaseRepository } from './BaseRepository'

export class AuditLogRepository extends BaseRepository<IAuditLogDocument, IAuditLog> {
    constructor() {
        super(AuditLog as any)
    }

    async log(entry: Omit<IAuditLog, 'timestamp'>) {
        return this.create(entry as any)
    }

    async getLogsByUser(userId: string, limit = 50) {
        return this.find({ userId }, { timestamp: -1 }, limit)
    }

    async getRecentSecurityEvents(limit = 100) {
        await this.ensureConnection()
        const securityActions = [
            AuditAction.LOGIN_FAILURE,
            AuditAction.MFA_ENROLLED,
            AuditAction.MFA_DISABLED,
            AuditAction.PASSWORD_CHANGE,
            AuditAction.ACCOUNT_DELETION
        ]

        return await (this.model as any).find({ action: { $in: securityActions } })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean()
    }

    async getLogsByResource(resourceId: string, limit = 50) {
        return this.find({ resourceId }, { timestamp: -1 }, limit)
    }
}

export const auditLogRepository = new AuditLogRepository()
