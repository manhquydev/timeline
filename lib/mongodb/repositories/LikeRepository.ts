import { Like, ILikeDocument, ILike } from '../models'
import Post from '../models/Post'
import { BaseRepository } from './BaseRepository'

export class LikeRepository extends BaseRepository<ILikeDocument, ILike> {
    constructor() {
        super(Like as any)
    }
    async addLike(userId: string, postId: string, eventId?: string): Promise<ILikeDocument | null> {
        try {
            const like = await this.create({ userId, postId, eventId })

            // Increment likes_count on Post
            await Post.findOneAndUpdate(
                { id: postId },
                { $inc: { likes_count: 1 } }
            )

            return like
        } catch (error: any) {
            if (error.code === 11000) {
                // Duplicate key error (already liked)
                return null
            }
            throw error
        }
    }

    async removeLike(userId: string, postId: string): Promise<boolean> {
        await this.ensureConnection()
        const result = await (this.model as any).findOneAndDelete({ userId, postId })

        if (result) {
            // Decrement likes_count on Post
            await Post.findOneAndUpdate(
                { id: postId },
                { $inc: { likes_count: -1 } }
            )
        }

        return !!result
    }

    async getLikeCount(postId: string): Promise<number> {
        return this.count({ postId })
    }

    async hasUserLiked(userId: string, postId: string): Promise<boolean> {
        await this.ensureConnection()
        const like = await (this.model as any).exists({ userId, postId })
        return !!like
    }

    async getLikesByPost(postId: string, limit = 20, offset = 0): Promise<ILike[]> {
        return this.findLean({ postId } as any, { sort: { createdAt: -1 }, limit })
    }
}

export const likeRepository = new LikeRepository()
