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
  async create(
    eventData: Omit<IEvent, 'id' | 'created_at' | 'updated_at' | 'stats' | 'enable_greeting_cards' | 'greeting_tag'> & {
      enable_greeting_cards?: boolean
      greeting_tag?: string | null
    }
  ): Promise<IEventDocument> {
    return super.create({
      ...eventData,
      enable_greeting_cards: eventData.enable_greeting_cards ?? false,
      greeting_tag: eventData.greeting_tag ?? null,
      stats: {
        total_photos: 0,
        total_videos: 0,
        total_contributors: 0,
      },
    } as any)
  }


  /**
   * Find event by slug (lean for performance)
   */
  async findBySlug(slug: string): Promise<IEvent | null> {
    return this.findOneLean({ slug } as any)
  }

  /**
   * Find all public events (open or closed) - lean for performance
   */
  async findPublic(): Promise<IEvent[]> {
    return this.findLean(
      { status: { $in: ['open', 'closed'] } } as any,
      { sort: { event_date: -1 } }
    )
  }

  /**
   * Find all events by status - lean for performance
   */
  async findByStatus(status: EventStatus): Promise<IEvent[]> {
    return this.findLean({ status } as any, { sort: { event_date: -1 } })
  }

  /**
   * Find all events - lean for performance
   */
  async findAll(sortBy: 'event_date' | 'created_at' = 'event_date'): Promise<IEvent[]> {
    return this.findLean({}, { sort: { [sortBy]: -1 } })
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

  /**
   * Find the latest active event that should drive homepage greeting cards for a theme
   */
  async findActiveGreetingEventByTheme(themeId: string, now: Date = new Date()): Promise<IEvent | null> {
    const events = await this.findLean(
      {
        theme_id: themeId,
        status: 'open',
        allow_wishes: true,
        enable_greeting_cards: true,
        start_date: { $lte: now },
        $or: [
          { end_date: null },
          { end_date: { $gte: now } },
        ],
      } as any,
      {
        sort: { start_date: -1, event_date: -1 },
        limit: 1,
      },
    )

    return events[0] || null
  }
}

// Export singleton instance
export const eventRepository = new EventRepository()
