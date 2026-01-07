import { Like, ILikeDocument } from '../models'
import { connectToDatabase } from '../connection'

export class LikeRepository {
    async addLike(userId: string, postId: string, eventId?: string): Promise<ILikeDocument | null> {
        await connectToDatabase()
        try {
            const like = await Like.create({ userId, postId, eventId })
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
        await connectToDatabase()
        const result = await Like.findOneAndDelete({ userId, postId })
        return !!result
    }

    async getLikeCount(postId: string): Promise<number> {
        await connectToDatabase()
        return await Like.countDocuments({ postId })
    }

    async hasUserLiked(userId: string, postId: string): Promise<boolean> {
        await connectToDatabase()
        const like = await Like.exists({ userId, postId })
        return !!like
    }

    async getLikesByPost(postId: string, limit = 20, offset = 0): Promise<ILikeDocument[]> {
        await connectToDatabase()
        const likes = await Like.find({ postId })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean()

        return likes as unknown as ILikeDocument[]
    }
}

export const likeRepository = new LikeRepository()
