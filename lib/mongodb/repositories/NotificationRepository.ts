import { Notification, INotification, NotificationType } from '../models'
import { connectToDatabase } from '../connection'

export class NotificationRepository {
    async create(entry: Omit<INotification, 'createdAt' | 'read'>) {
        await connectToDatabase()
        return await Notification.create({
            ...entry,
            read: false,
            createdAt: new Date()
        })
    }

    async getNotifications(userId: string, limit = 20, offset = 0) {
        await connectToDatabase()
        return await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean()
    }

    async getUnreadCount(userId: string) {
        await connectToDatabase()
        return await Notification.countDocuments({ userId, read: false })
    }

    async markAsRead(notificationId: string) {
        await connectToDatabase()
        return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true })
    }

    async markAllAsRead(userId: string) {
        await connectToDatabase()
        return await Notification.updateMany({ userId, read: false }, { read: true })
    }

    async delete(notificationId: string) {
        await connectToDatabase()
        return await Notification.findByIdAndDelete(notificationId)
    }

    async createSystemNotification(userId: string, title: string, message: string, link?: string) {
        return this.create({
            userId,
            type: NotificationType.SYSTEM,
            title,
            message,
            link
        })
    }
}

export const notificationRepository = new NotificationRepository()
