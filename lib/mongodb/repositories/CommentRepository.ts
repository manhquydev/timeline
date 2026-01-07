import { Comment, ICommentDocument, IComment } from '../models'
import Post from '../models/Post'
import { BaseRepository } from './BaseRepository'

export class CommentRepository extends BaseRepository<ICommentDocument, IComment> {
    constructor() {
        super(Comment as any)
    }
    async createComment(userId: string, postId: string, content: string, eventId?: string, parentCommentId?: string): Promise<ICommentDocument> {
        const comment = await this.create({
            userId,
            postId,
            content,
            eventId,
            parentCommentId
        })

        // Increment comments_count on Post
        await Post.findOneAndUpdate(
            { id: postId },
            { $inc: { comments_count: 1 } }
        )

        return comment
    }

    async getCommentsByPost(postId: string, limit = 50, offset = 0): Promise<ICommentDocument[]> {
        return this.find({ postId }, { createdAt: -1 }, limit)
    }

    async getCommentById(commentId: string): Promise<ICommentDocument | null> {
        return this.findOne({ _id: commentId })
    }

    async updateComment(commentId: string, content: string, userId: string): Promise<ICommentDocument | null> {
        await this.ensureConnection()
        return await (this.model as any).findOneAndUpdate(
            { _id: commentId, userId }, // Ensure ownership
            { content, isEdited: true, updatedAt: new Date() },
            { new: true }
        )
    }

    async deleteComment(commentId: string, userId: string): Promise<boolean> {
        await this.ensureConnection()
        // Ideally checking for admin roles or post owner roles would happen in service layer
        // This basic repository method ensures user owns the comment
        const comment = await (this.model as any).findOne({ _id: commentId, userId })
        if (!comment) return false

        const postId = comment.postId
        const result = await (this.model as any).deleteOne({ _id: commentId, userId })

        if (result.deletedCount > 0) {
            // Decrement comments_count on Post
            await Post.findOneAndUpdate(
                { id: postId },
                { $inc: { comments_count: -1 } }
            )
        }

        return result.deletedCount > 0
    }

    async countComments(postId: string): Promise<number> {
        return this.count({ postId })
    }
}

export const commentRepository = new CommentRepository()
