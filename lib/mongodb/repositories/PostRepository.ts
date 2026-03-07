import { BaseRepository } from './BaseRepository'
import Post, { IPost, IPostDocument, MediaType, PostStatus } from '../models/Post'
import { unstable_cache } from 'next/cache'
import { Types } from 'mongoose'

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
   * Find a random approved post that has wish text for an event.
   * Used by homepage falling cards to display real event wishes.
   */
  async findRandomApprovedWishByEvent(eventId: string): Promise<IPost | null> {
    await this.ensureConnection()
    const results = await Post.aggregate([
      {
        $match: {
          event_id: eventId,
          status: 'approved',
          wish_text: { $exists: true, $type: 'string', $ne: '' },
        },
      },
      { $sample: { size: 1 } },
    ])

    return (results[0] as IPost) ?? null
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

  /**
   * Find posts with cursor-based pagination (for infinite scroll)
   * More efficient than skip/limit for large datasets
   */
  async findWithCursor(
    eventId: string,
    limit = 20,
    cursor?: string, // timestamp ISO string
    status: PostStatus = 'approved'
  ): Promise<{ posts: IPostDocument[]; nextCursor: string | null }> {
    await this.ensureConnection()

    const query: any = { event_id: eventId, status }

    if (cursor) {
      query.uploaded_at = { $lt: new Date(cursor) }
    }

    const posts = await Post.find(query)
      .sort({ uploaded_at: -1 })
      .limit(limit)
      .lean() as unknown as IPostDocument[]

    let nextCursor = null
    if (posts.length === limit) {
      const lastPost = posts[posts.length - 1]
      // Ensure uploaded_at is a Date object or string
      if (lastPost.uploaded_at) {
        nextCursor = new Date(lastPost.uploaded_at).toISOString()
      }
    }

    return {
      posts,
      nextCursor
    }
  }

  /**
   * Get cached event stats (revalidated every 60 seconds or on demand)
   * Uses Next.js data cache to avoid excessive DB aggregation calls
   */
  async getEventStatsCached(eventId: string) {
    return unstable_cache(
      async () => this.getEventStats(eventId),
      [`event-stats-${eventId}`],
      {
        tags: [`event-stats-${eventId}`],
        revalidate: 60 // Cache for 60 seconds
      }
    )()
  }

  /**
   * Batch fetch posts for multiple events in a single query
   * Solves N+1 query problem when loading homepage with multiple events
   * Returns a Map of eventId -> posts array
   */
  async findPostsByEventIds(
    eventIds: string[],
    limitPerEvent = 6,
    status: PostStatus = 'approved'
  ): Promise<Map<string, IPost[]>> {
    await this.ensureConnection()

    if (eventIds.length === 0) {
      return new Map()
    }

    // Use aggregation pipeline to fetch limited posts per event in single query
    const results = await Post.aggregate([
      {
        $match: {
          event_id: { $in: eventIds },
          status: status
        }
      },
      { $sort: { uploaded_at: -1 } },
      {
        $group: {
          _id: '$event_id',
          posts: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 1,
          posts: { $slice: ['$posts', limitPerEvent] }
        }
      }
    ])

    // Convert to Map for easy lookup
    const postsMap = new Map<string, IPost[]>()
    for (const result of results) {
      postsMap.set(result._id, result.posts as IPost[])
    }

    // Ensure all eventIds have an entry (even if empty)
    for (const eventId of eventIds) {
      if (!postsMap.has(eventId)) {
        postsMap.set(eventId, [])
      }
    }

    return postsMap
  }
}

// Export singleton instance
export const postRepository = new PostRepository()
