import mongoose, { Schema, Document } from 'mongoose'

export enum NotificationType {
    SYSTEM = 'system',
    POST_LIKE = 'post_like',
    POST_COMMENT = 'post_comment',
    MENTION = 'mention',
    EVENT_INVITE = 'event_invite',
    WORKFLOW_ALERT = 'workflow_alert'
}

export interface INotification {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    read: boolean
    metadata?: Record<string, any>
    createdAt: Date
}

export interface INotificationDocument extends INotification, Document { }

const NotificationSchema = new Schema<INotificationDocument>({
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true }
})

// Compound index for user inbox
NotificationSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema)
