import { Notification, INotification, NotificationType, INotificationDocument } from '../models'
import { BaseRepository } from './BaseRepository'

export class NotificationRepository extends BaseRepository<INotificationDocument, INotification> {
    constructor() {
        super(Notification as any)
    }

    async createNotification(entry: Omit<INotification, 'createdAt' | 'read'>) {
        return this.create({
            ...entry,
            read: false,
        } as any)
    }

    async getNotifications(userId: string, limit = 20, offset = 0): Promise<INotification[]> {
        return this.findLean({ userId } as any, { sort: { createdAt: -1 }, limit })
    }

    async getUnreadCount(userId: string) {
        return this.count({ userId, read: false })
    }

    async markAsRead(notificationId: string) {
        return this.updateNotification(notificationId, { read: true })
    }

    async updateNotification(id: string, updates: Partial<INotification>) {
        await this.ensureConnection()
        return await (this.model as any).findByIdAndUpdate(id, updates, { new: true })
    }

    async markAllAsRead(userId: string) {
        return this.updateMany({ userId, read: false }, { read: true })
    }

    async deleteNotification(notificationId: string) {
        await this.ensureConnection()
        return await (this.model as any).findByIdAndDelete(notificationId)
    }

    async createSystemNotification(userId: string, title: string, message: string, link?: string) {
        return this.createNotification({
            userId,
            type: NotificationType.SYSTEM,
            title,
            message,
            link
        })
    }
}

export const notificationRepository = new NotificationRepository()
