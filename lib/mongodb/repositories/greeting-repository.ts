import { nanoid } from 'nanoid'
import { connectToDatabase } from '../connection'
import Greeting, { IGreeting } from '../models/Greeting'

type GreetingAdminStatus = 'pending' | 'approved' | 'rejected' | 'all'

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
      authorName: data.authorName || '?n danh',
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

    const normalizedEventId = eventId?.trim()
    const normalizedTag = eventTag?.trim().toLowerCase()

    if (normalizedEventId) {
      const byEventId = await Greeting.aggregate([
        { $match: { eventId: normalizedEventId, isApproved: true, isDeleted: false } },
        { $sample: { size: 1 } },
      ])

      if (byEventId[0]) return byEventId[0] as IGreeting

      if (normalizedTag) {
        // Backward compatibility for old rows that only persisted eventTag.
        const byLegacyTag = await Greeting.aggregate([
          {
            $match: {
              eventTag: normalizedTag,
              isApproved: true,
              isDeleted: false,
              $or: [{ eventId: null }, { eventId: '' }, { eventId: { $exists: false } }],
            },
          },
          { $sample: { size: 1 } },
        ])

        if (byLegacyTag[0]) return byLegacyTag[0] as IGreeting
      }

      return null
    }

    if (!normalizedTag) return null

    const results = await Greeting.aggregate([
      { $match: { eventTag: normalizedTag, isApproved: true, isDeleted: false } },
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
    status?: GreetingAdminStatus
    q?: string
  }): Promise<{ items: IGreeting[]; total: number }> {
    await this.ensureConnected()
    const { page = 1, limit = 20, eventTag, eventId, approved, status, q } = opts
    const query: Record<string, unknown> = {}

    const effectiveStatus: GreetingAdminStatus | null =
      status ?? (approved === undefined ? null : approved ? 'approved' : 'pending')

    if (effectiveStatus === 'pending') {
      query.isApproved = false
      query.isDeleted = false
    } else if (effectiveStatus === 'approved') {
      query.isApproved = true
      query.isDeleted = false
    } else if (effectiveStatus === 'rejected') {
      query.isDeleted = true
    }

    if (eventTag) query.eventTag = eventTag
    if (eventId) query.eventId = eventId

    if (q && q.trim().length > 0) {
      const pattern = q.trim()
      query.$or = [
        { authorName: { $regex: pattern, $options: 'i' } },
        { message: { $regex: pattern, $options: 'i' } },
        { eventTag: { $regex: pattern, $options: 'i' } },
        { eventSlug: { $regex: pattern, $options: 'i' } },
      ]
    }

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
    await Greeting.updateOne({ id }, { isApproved: true, isDeleted: false })
  }

  async unapprove(id: string): Promise<void> {
    await this.ensureConnected()
    await Greeting.updateOne({ id }, { isApproved: false, isDeleted: false })
  }

  async reject(id: string): Promise<void> {
    await this.ensureConnected()
    await Greeting.updateOne({ id }, { isDeleted: true, isApproved: false })
  }

  async restore(id: string): Promise<void> {
    await this.ensureConnected()
    await Greeting.updateOne({ id }, { isDeleted: false })
  }

  async updateById(
    id: string,
    data: Partial<Pick<IGreeting, 'authorName' | 'message' | 'eventTag' | 'eventId' | 'eventSlug' | 'templateId'>>
  ): Promise<void> {
    await this.ensureConnected()
    const updateDoc: Record<string, unknown> = {}

    if (typeof data.authorName === 'string') updateDoc.authorName = data.authorName
    if (typeof data.message === 'string') updateDoc.message = data.message
    if (typeof data.eventTag === 'string') updateDoc.eventTag = data.eventTag
    if (data.eventId !== undefined) updateDoc.eventId = data.eventId
    if (data.eventSlug !== undefined) updateDoc.eventSlug = data.eventSlug
    if (data.templateId !== undefined) updateDoc.templateId = data.templateId

    if (Object.keys(updateDoc).length === 0) return
    await Greeting.updateOne({ id }, updateDoc)
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

