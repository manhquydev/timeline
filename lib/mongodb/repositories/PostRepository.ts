import { connectToDatabase } from '../connection'
import Post, { IPost, IPostDocument, MediaType, PostStatus } from '../models/Post'
import { nanoid } from 'nanoid'

/**
 * Post Repository
 * Handles all database operations for posts
 */
export class PostRepository {
  /**
   * Ensure database connection before operations
   */
  private async ensureConnection() {
    await connectToDatabase()
  }

  /**
   * Create a new post
   */
  async create(postData: Omit<IPost, 'id' | 'uploaded_at' | 'view_count'>): Promise<IPostDocument> {
    await this.ensureConnection()

    const post = new Post({
      id: nanoid(),
      ...postData,
      uploaded_at: new Date(),
      view_count: 0,
    })

    return await post.save()
  }

  /**
   * Find post by ID
   */
  async findById(id: string) {
    await this.ensureConnection()
    return await Post.findOne({ id }).lean()
  }

  async findAll(filter: any = {}) {
    await this.ensureConnection()
    return await Post.find(filter).sort({ uploaded_at: -1 }).lean()
  }

  /**
   * Find all posts for an event
   */
  async findByEvent(eventId: string, status?: PostStatus): Promise<IPostDocument[]> {
    await this.ensureConnection()
    const query: any = { event_id: eventId }
    if (status) {
      query.status = status
    }
    return await Post.find(query).sort({ uploaded_at: -1 })
  }

  /**
   * Find approved posts for an event
   */
  async findApprovedByEvent(eventId: string): Promise<IPostDocument[]> {
    await this.ensureConnection()
    return await Post.find({
      event_id: eventId,
      status: 'approved'
    }).sort({ uploaded_at: -1 })
  }

  /**
   * Find posts by user
   */
  async findByUser(userId: string): Promise<IPostDocument[]> {
    await this.ensureConnection()
    return await Post.find({ user_id: userId }).sort({ uploaded_at: -1 })
  }

  /**
   * Find all approved posts
   */
  async findAllApproved(limit?: number): Promise<IPostDocument[]> {
    await this.ensureConnection()
    const query = Post.find({ status: 'approved' }).sort({ uploaded_at: -1 })
    if (limit) {
      query.limit(limit)
    }
    return await query
  }

  /**
   * Find posts with pagination
   */
  async findWithPagination(
    eventId: string,
    page = 1,
    limit = 20,
    status: PostStatus = 'approved'
  ): Promise<{ posts: IPostDocument[]; total: number; hasMore: boolean }> {
    await this.ensureConnection()

    const skip = (page - 1) * limit
    const query = { event_id: eventId, status }

    const [posts, total] = await Promise.all([
      Post.find(query).sort({ uploaded_at: -1 }).skip(skip).limit(limit),
      Post.countDocuments(query),
    ])

    return {
      posts,
      total,
      hasMore: skip + posts.length < total,
    }
  }

  /**
   * Update post
   */
  async update(id: string, updateData: Partial<IPost>): Promise<IPostDocument | null> {
    await this.ensureConnection()
    return await Post.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    )
  }

  /**
   * Delete post
   */
  async delete(id: string): Promise<boolean> {
    await this.ensureConnection()
    const result = await Post.deleteOne({ id })
    return result.deletedCount > 0
  }

  /**
   * Delete all posts for an event
   */
  async deleteByEvent(eventId: string): Promise<number> {
    await this.ensureConnection()
    const result = await Post.deleteMany({ event_id: eventId })
    return result.deletedCount || 0
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<IPostDocument | null> {
    await this.ensureConnection()
    return await Post.findOneAndUpdate(
      { id },
      { $inc: { view_count: 1 } },
      { new: true }
    )
  }

  /**
   * Approve post
   */
  async approve(id: string): Promise<IPostDocument | null> {
    await this.ensureConnection()
    return await Post.findOneAndUpdate(
      { id },
      { $set: { status: 'approved' } },
      { new: true }
    )
  }

  /**
   * Reject post
   */
  async reject(id: string): Promise<IPostDocument | null> {
    await this.ensureConnection()
    return await Post.findOneAndUpdate(
      { id },
      { $set: { status: 'rejected' } },
      { new: true }
    )
  }

  /**
   * Bulk approve posts
   */
  async bulkApprove(ids: string[]): Promise<number> {
    await this.ensureConnection()
    const result = await Post.updateMany(
      { id: { $in: ids } },
      { $set: { status: 'approved' } }
    )
    return result.modifiedCount || 0
  }

  /**
   * Bulk reject posts
   */
  async bulkReject(ids: string[]): Promise<number> {
    await this.ensureConnection()
    const result = await Post.updateMany(
      { id: { $in: ids } },
      { $set: { status: 'rejected' } }
    )
    return result.modifiedCount || 0
  }

  /**
   * Count posts by event
   */
  async countByEvent(eventId: string, status?: PostStatus): Promise<number> {
    await this.ensureConnection()
    const query: any = { event_id: eventId }
    if (status) {
      query.status = status
    }
    return await Post.countDocuments(query)
  }

  /**
   * Count posts by media type
   */
  async countByMediaType(eventId: string, mediaType: MediaType, status: PostStatus = 'approved'): Promise<number> {
    await this.ensureConnection()
    return await Post.countDocuments({
      event_id: eventId,
      media_type: mediaType,
      status: status
    })
  }

  /**
   * Get unique contributors for an event
   */
  async getUniqueContributors(eventId: string, status: PostStatus = 'approved'): Promise<string[]> {
    await this.ensureConnection()
    const contributors = await Post.distinct('user_id', {
      event_id: eventId,
      user_id: { $ne: null },
      status: status
    })
    return contributors.filter(Boolean)
  }

  /**
   * Get event stats (only approved posts)
   */
  async getEventStats(eventId: string): Promise<{
    total_photos: number
    total_videos: number
    total_contributors: number
    total_posts: number
  }> {
    await this.ensureConnection()

    const [photos, videos, contributors, total] = await Promise.all([
      this.countByMediaType(eventId, 'image', 'approved'),
      this.countByMediaType(eventId, 'video', 'approved'),
      this.getUniqueContributors(eventId, 'approved'),
      this.countByEvent(eventId, 'approved'),
    ])

    return {
      total_photos: photos,
      total_videos: videos,
      total_contributors: contributors.length,
      total_posts: total,
    }
  }
}

// Export singleton instance
export const postRepository = new PostRepository()
