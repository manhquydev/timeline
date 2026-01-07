import Event, { IEvent, IEventDocument, EventStatus } from '../models/Event'
import { BaseRepository } from './BaseRepository'

/**
 * Event Repository
 * Handles all database operations for events
 */
export class EventRepository extends BaseRepository<IEventDocument, IEvent> {
  constructor() {
    super(Event)
  }

  /**
   * Create a new event
   */
  async create(eventData: Omit<IEvent, 'id' | 'created_at' | 'updated_at' | 'stats'>): Promise<IEventDocument> {
    return super.create({
      ...eventData,
      stats: {
        total_photos: 0,
        total_videos: 0,
        total_contributors: 0,
      },
    } as any)
  }


  /**
   * Find event by slug
   */
  async findBySlug(slug: string): Promise<IEventDocument | null> {
    return this.findOne({ slug })
  }

  /**
   * Find all public events (open or closed)
   */
  async findPublic(): Promise<IEventDocument[]> {
    return this.find({
      status: { $in: ['open', 'closed'] }
    }, { event_date: -1 })
  }

  /**
   * Find all events by status
   */
  async findByStatus(status: EventStatus): Promise<IEventDocument[]> {
    return this.find({ status }, { event_date: -1 })
  }

  /**
   * Find all events
   */
  async findAll(sortBy: 'event_date' | 'created_at' = 'event_date'): Promise<IEventDocument[]> {
    return this.find({}, { [sortBy]: -1 })
  }


  /**
   * Increment photo count for event
   */
  async incrementPhotoCount(id: string, count = 1): Promise<IEventDocument | null> {
    return this.update(id, { $inc: { 'stats.total_photos': count } } as any)
  }

  /**
   * Increment video count for event
   */
  async incrementVideoCount(id: string, count = 1): Promise<IEventDocument | null> {
    return this.update(id, { $inc: { 'stats.total_videos': count } } as any)
  }

  /**
   * Increment contributor count for event
   */
  async incrementContributorCount(id: string, count = 1): Promise<IEventDocument | null> {
    return this.update(id, { $inc: { 'stats.total_contributors': count } } as any)
  }

  /**
   * Update event stats (recalculate from posts)
   */
  async updateStats(
    id: string,
    stats: { total_photos: number; total_videos: number; total_contributors: number }
  ): Promise<IEventDocument | null> {
    return this.update(id, { stats })
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const query: any = { slug }
    if (excludeId) {
      query.id = { $ne: excludeId }
    }
    const event = await this.findOne(query)
    return !event
  }

  /**
   * Get events count by status
   */
  async countByStatus(status: EventStatus): Promise<number> {
    return this.count({ status })
  }

  /**
   * Bulk update events
   */
  async updateMany(filter: any, update: any) {
    await this.ensureConnection()
    return await Event.updateMany(filter, update)
  }
}

// Export singleton instance
export const eventRepository = new EventRepository()
