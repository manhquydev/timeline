import mongoose, { Schema, Document } from 'mongoose'

export interface ILike {
    userId: string
    postId: string
    eventId?: string
    createdAt: Date
}

export interface ILikeDocument extends ILike, Document { }

const LikeSchema = new Schema<ILikeDocument>({
    userId: { type: String, required: true, index: true },
    postId: { type: String, required: true, index: true },
    eventId: { type: String, index: true }, // Optional link to event context
    createdAt: { type: Date, default: Date.now }
})

// Prevent duplicate likes from same user on same post
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true })

export default mongoose.models.Like || mongoose.model<ILikeDocument>('Like', LikeSchema)
