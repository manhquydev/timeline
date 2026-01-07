import { Comment, ICommentDocument } from '../models'
import { connectToDatabase } from '../connection'

export class CommentRepository {
    async createComment(userId: string, postId: string, content: string, eventId?: string, parentCommentId?: string): Promise<ICommentDocument> {
        await connectToDatabase()
        const comment = await Comment.create({
            userId,
            postId,
            content,
            eventId,
            parentCommentId
        })
        return comment
    }

    async getCommentsByPost(postId: string, limit = 50, offset = 0): Promise<ICommentDocument[]> {
        await connectToDatabase()
        const comments = await Comment.find({ postId })
            .sort({ createdAt: -1 }) // Newest first
            .skip(offset)
            .limit(limit)
            .lean()

        return comments as unknown as ICommentDocument[]
    }

    async getCommentById(commentId: string): Promise<ICommentDocument | null> {
        await connectToDatabase()
        return await Comment.findById(commentId)
    }

    async updateComment(commentId: string, content: string, userId: string): Promise<ICommentDocument | null> {
        await connectToDatabase()
        return await Comment.findOneAndUpdate(
            { _id: commentId, userId }, // Ensure ownership
            { content, isEdited: true, updatedAt: new Date() },
            { new: true }
        )
    }

    async deleteComment(commentId: string, userId: string): Promise<boolean> {
        await connectToDatabase()
        // Ideally checking for admin roles or post owner roles would happen in service layer
        // This basic repository method ensures user owns the comment
        const result = await Comment.findOneAndDelete({ _id: commentId, userId })
        return !!result
    }

    async countComments(postId: string): Promise<number> {
        await connectToDatabase()
        return await Comment.countDocuments({ postId })
    }
}

export const commentRepository = new CommentRepository()
