import { nanoid } from 'nanoid'
import { connectToDatabase } from '../connection'
import Greeting, { IGreeting } from '../models/Greeting'

export class GreetingRepository {
  private async ensureConnected() {
    await connectToDatabase()
  }

  async create(
    data: Pick<IGreeting, 'authorId' | 'authorName' | 'message' | 'eventTag'> & {
      eventId?: string | null
      eventSlug?: string | null
      templateId?: number | null
    }
  ): Promise<IGreeting> {
    await this.ensureConnected()
    const doc = await Greeting.create({
      id: nanoid(),
      authorId: data.authorId ?? null,
      authorName: data.authorName || 'Ẩn danh',
      message: data.message,
      eventTag: data.eventTag || 'general',
      eventId: data.eventId ?? null,
      eventSlug: data.eventSlug ?? null,
      templateId: data.templateId ?? null,
      isApproved: false,
      isDeleted: false,
    })
    return doc.toObject() as IGreeting
  }

  async findRandom(eventTag: string): Promise<IGreeting | null> {
    await this.ensureConnected()
    const results = await Greeting.aggregate([
      { $match: { eventTag, isApproved: true, isDeleted: false } },
      { $sample: { size: 1 } },
    ])
    return results[0] ?? null
  }

  async findRandomByEventContext(eventId?: string | null, eventTag?: string | null): Promise<IGreeting | null> {
    await this.ensureConnected()
    const match: Record<string, unknown> = { isApproved: true, isDeleted: false }

    const normalizedEventId = eventId?.trim()
    const normalizedTag = eventTag?.trim().toLowerCase()

    // If an eventId exists, always query strictly by eventId to avoid leaking
    // greetings from other events that happen to share a generic tag.
    if (normalizedEventId) {
      match.eventId = normalizedEventId
    } else if (normalizedTag) {
      match.eventTag = normalizedTag
    } else {
      return null
    }

    const results = await Greeting.aggregate([
      { $match: match },
      { $sample: { size: 1 } },
    ])
    return results[0] ?? null
  }

  async findApprovedById(id: string): Promise<IGreeting | null> {
    await this.ensureConnected()
    return await Greeting.findOne({ id, isApproved: true, isDeleted: false }).lean<IGreeting>()
  }

  async findAll(opts: {
    page?: number
    limit?: number
    eventTag?: string
    eventId?: string
    approved?: boolean
  }): Promise<{ items: IGreeting[]; total: number }> {
    await this.ensureConnected()
    const { page = 1, limit = 20, eventTag, eventId, approved } = opts
    const query: Record<string, unknown> = { isDeleted: false }
    if (eventTag) query.eventTag = eventTag
    if (eventId) query.eventId = eventId
    if (approved !== undefined) query.isApproved = approved

    const [items, total] = await Promise.all([
      Greeting.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Greeting.countDocuments(query),
    ])
    return { items: items as IGreeting[], total }
  }

  async approve(id: string): Promise<void> {
    await this.ensureConnected()
    await Greeting.updateOne({ id }, { isApproved: true })
  }

  async reject(id: string): Promise<void> {
    await this.ensureConnected()
    await Greeting.updateOne({ id }, { isDeleted: true })
  }

  async deleteById(id: string): Promise<void> {
    await this.ensureConnected()
    await Greeting.deleteOne({ id })
  }

  async countPending(eventTag?: string): Promise<number> {
    await this.ensureConnected()
    const query: Record<string, unknown> = { isApproved: false, isDeleted: false }
    if (eventTag) query.eventTag = eventTag
    return Greeting.countDocuments(query)
  }
}

export const greetingRepository = new GreetingRepository()
