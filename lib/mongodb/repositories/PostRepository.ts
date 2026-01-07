import { BaseRepository } from './BaseRepository'
import Post, { IPost, IPostDocument, MediaType, PostStatus } from '../models/Post'

/**
 * Post Repository
 * Handles all database operations for posts
 */
export class PostRepository extends BaseRepository<IPostDocument, IPost> {
  constructor() {
    super(Post)
  }

  /**
   * Create a new post
   */
  async create(postData: Omit<IPost, 'id' | 'uploaded_at' | 'view_count'>): Promise<IPostDocument> {
    return super.create({
      ...postData,
      uploaded_at: new Date(),
      view_count: 0,
    } as any)
  }

  async findAll(filter: any = {}) {
    return this.find(filter)
  }

  /**
   * Find all posts for an event
   */
  async findByEvent(eventId: string, status?: PostStatus): Promise<IPostDocument[]> {
    const query: any = { event_id: eventId }
    if (status) {
      query.status = status
    }
    return this.find(query, { uploaded_at: -1 })
  }

  /**
   * Find approved posts for an event
   */
  async findApprovedByEvent(eventId: string): Promise<IPostDocument[]> {
    return this.find({
      event_id: eventId,
      status: 'approved'
    }, { uploaded_at: -1 })
  }

  /**
   * Find posts by user
   */
  async findByUser(userId: string): Promise<IPostDocument[]> {
    return this.find({ user_id: userId }, { uploaded_at: -1 })
  }

  /**
   * Find all approved posts
   */
  async findAllApproved(limit?: number): Promise<IPostDocument[]> {
    return this.find({ status: 'approved' }, { uploaded_at: -1 }, limit)
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
      Post.find(query).sort({ uploaded_at: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(query),
    ])

    return {
      posts: posts as unknown as IPostDocument[],
      total,
      hasMore: skip + posts.length < total,
    }
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
    return this.update(id, { $inc: { view_count: 1 } } as any)
  }

  /**
   * Approve post
   */
  async approve(id: string): Promise<IPostDocument | null> {
    return this.update(id, { status: 'approved' })
  }

  /**
   * Reject post
   */
  async reject(id: string): Promise<IPostDocument | null> {
    return this.update(id, { status: 'rejected' })
  }

  /**
   * Bulk approve posts
   */
  async bulkApprove(ids: string[]): Promise<number> {
    const result = await this.updateMany(
      { id: { $in: ids } },
      { status: 'approved' }
    )
    return result.modifiedCount || 0
  }

  /**
   * Bulk reject posts
   */
  async bulkReject(ids: string[]): Promise<number> {
    const result = await this.updateMany(
      { id: { $in: ids } },
      { status: 'rejected' }
    )
    return result.modifiedCount || 0
  }

  /**
   * Count posts by event
   */
  async countByEvent(eventId: string, status?: PostStatus): Promise<number> {
    const query: any = { event_id: eventId }
    if (status) {
      query.status = status
    }
    return this.count(query)
  }

  /**
   * Count posts by media type
   */
  async countByMediaType(eventId: string, mediaType: MediaType, status: PostStatus = 'approved'): Promise<number> {
    return this.count({
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

  /**
   * Update AI-generated metadata for a post
   */
  async updateAIMetadata(id: string, data: {
    tags: string[];
    description: string;
    metadata?: any;
  }): Promise<IPostDocument | null> {
    return this.update(id, {
      ai_tags: data.tags,
      ai_description: data.description,
      ai_metadata: data.metadata || {},
      ai_processed: true,
    } as any)
  }

  /**
   * Search posts using a natural language query (translated to filters)
   */
  async searchWithFilters(filters: any, limit = 50): Promise<IPostDocument[]> {
    return this.find(filters, { uploaded_at: -1 }, limit)
  }
}

// Export singleton instance
export const postRepository = new PostRepository()
