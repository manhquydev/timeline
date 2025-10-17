import { connectToDatabase } from '../connection'
import Event, { IEvent, IEventDocument, EventStatus } from '../models/Event'
import { nanoid } from 'nanoid'

/**
 * Event Repository
 * Handles all database operations for events
 */
export class EventRepository {
  /**
   * Ensure database connection before operations
   */
  private async ensureConnection() {
    await connectToDatabase()
  }

  /**
   * Create a new event
   */
  async create(eventData: Omit<IEvent, 'id' | 'created_at' | 'updated_at' | 'stats'>): Promise<IEventDocument> {
    await this.ensureConnection()

    const event = new Event({
      id: nanoid(),
      ...eventData,
      stats: {
        total_photos: 0,
        total_videos: 0,
        total_contributors: 0,
      },
    })

    return await event.save()
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<IEventDocument | null> {
    await this.ensureConnection()
    return await Event.findOne({ id })
  }

  /**
   * Find event by slug
   */
  async findBySlug(slug: string): Promise<IEventDocument | null> {
    await this.ensureConnection()
    return await Event.findOne({ slug })
  }

  /**
   * Find all public events (open or closed)
   */
  async findPublic(): Promise<IEventDocument[]> {
    await this.ensureConnection()
    return await Event.find({
      status: { $in: ['open', 'closed'] }
    }).sort({ event_date: -1 })
  }

  /**
   * Find all events by status
   */
  async findByStatus(status: EventStatus): Promise<IEventDocument[]> {
    await this.ensureConnection()
    return await Event.find({ status }).sort({ event_date: -1 })
  }

  /**
   * Find all events
   */
  async findAll(sortBy: 'event_date' | 'created_at' = 'event_date'): Promise<IEventDocument[]> {
    await this.ensureConnection()
    return await Event.find().sort({ [sortBy]: -1 })
  }

  /**
   * Update event
   */
  async update(id: string, updateData: Partial<IEvent>): Promise<IEventDocument | null> {
    await this.ensureConnection()
    return await Event.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    )
  }

  /**
   * Delete event
   */
  async delete(id: string): Promise<boolean> {
    await this.ensureConnection()
    const result = await Event.deleteOne({ id })
    return result.deletedCount > 0
  }

  /**
   * Increment photo count for event
   */
  async incrementPhotoCount(id: string, count = 1): Promise<IEventDocument | null> {
    await this.ensureConnection()
    return await Event.findOneAndUpdate(
      { id },
      { $inc: { 'stats.total_photos': count } },
      { new: true }
    )
  }

  /**
   * Increment video count for event
   */
  async incrementVideoCount(id: string, count = 1): Promise<IEventDocument | null> {
    await this.ensureConnection()
    return await Event.findOneAndUpdate(
      { id },
      { $inc: { 'stats.total_videos': count } },
      { new: true }
    )
  }

  /**
   * Increment contributor count for event
   */
  async incrementContributorCount(id: string, count = 1): Promise<IEventDocument | null> {
    await this.ensureConnection()
    return await Event.findOneAndUpdate(
      { id },
      { $inc: { 'stats.total_contributors': count } },
      { new: true }
    )
  }

  /**
   * Update event stats (recalculate from posts)
   */
  async updateStats(
    id: string,
    stats: { total_photos: number; total_videos: number; total_contributors: number }
  ): Promise<IEventDocument | null> {
    await this.ensureConnection()
    return await Event.findOneAndUpdate(
      { id },
      { $set: { stats } },
      { new: true }
    )
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    await this.ensureConnection()
    const query: any = { slug }
    if (excludeId) {
      query.id = { $ne: excludeId }
    }
    const event = await Event.findOne(query)
    return !event
  }

  /**
   * Get events count by status
   */
  async countByStatus(status: EventStatus): Promise<number> {
    await this.ensureConnection()
    return await Event.countDocuments({ status })
  }

  /**
   * Get total events count
   */
  async count(): Promise<number> {
    await this.ensureConnection()
    return await Event.countDocuments()
  }
}

// Export singleton instance
export const eventRepository = new EventRepository()
