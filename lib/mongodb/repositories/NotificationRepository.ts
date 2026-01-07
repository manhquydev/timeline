import { Notification, INotification, NotificationType } from '../models'
import mongoose from 'mongoose'

export class NotificationRepository {
    private async ensureConnection() {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI!)
        }
    }

    async create(entry: Omit<INotification, 'createdAt' | 'read'>) {
        await this.ensureConnection()
        return await Notification.create({
            ...entry,
            read: false,
            createdAt: new Date()
        })
    }

    async getNotifications(userId: string, limit = 20) {
        await this.ensureConnection()
        return await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
    }

    async getUnreadCount(userId: string) {
        await this.ensureConnection()
        return await Notification.countDocuments({ userId, read: false })
    }

    async markAsRead(notificationId: string) {
        await this.ensureConnection()
        return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true })
    }

    async markAllAsRead(userId: string) {
        await this.ensureConnection()
        return await Notification.updateMany({ userId, read: false }, { read: true })
    }

    async delete(notificationId: string) {
        await this.ensureConnection()
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
