import mongoose, { Schema, Document } from 'mongoose'

export interface IComment {
    userId: string
    postId: string
    eventId?: string
    content: string
    parentCommentId?: string // For nested replies
    isEdited: boolean
    createdAt: Date
    updatedAt: Date
}

export interface ICommentDocument extends IComment, Document { }

const CommentSchema = new Schema<ICommentDocument>({
    userId: { type: String, required: true, index: true },
    postId: { type: String, required: true, index: true },
    eventId: { type: String, index: true },
    content: { type: String, required: true, maxlength: 1000 },
    parentCommentId: { type: String, default: null, index: true },
    isEdited: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
})

// Compound indexes for efficient querying
CommentSchema.index({ postId: 1, createdAt: 1 }) // Chronological comments on post
CommentSchema.index({ eventId: 1, createdAt: -1 }) // Recent comments in event scope

// Update timestamp on save
CommentSchema.pre('save', function (next) {
    this.updatedAt = new Date()
    next()
})

export default mongoose.models.Comment || mongoose.model<ICommentDocument>('Comment', CommentSchema)
