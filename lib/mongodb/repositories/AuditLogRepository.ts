import { AuditLog, IAuditLog, AuditAction } from '../models'
import mongoose from 'mongoose'

export class AuditLogRepository {
    private async ensureConnection() {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI!)
        }
    }

    async log(entry: Omit<IAuditLog, 'timestamp'>) {
        await this.ensureConnection()
        return await AuditLog.create({
            ...entry,
            timestamp: new Date()
        })
    }

    async getLogsByUser(userId: string, limit = 50) {
        await this.ensureConnection()
        return await AuditLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean()
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

        return await AuditLog.find({ action: { $in: securityActions } })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean()
    }

    async getLogsByResource(resourceId: string, limit = 50) {
        await this.ensureConnection()
        return await AuditLog.find({ resourceId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean()
    }
}

export const auditLogRepository = new AuditLogRepository()
