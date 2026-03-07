import { nanoid } from 'nanoid'
import { connectToDatabase } from '../connection'
import Greeting, { IGreeting } from '../models/Greeting'

export class GreetingRepository {
  private async ensureConnected() {
    await connectToDatabase()
  }

  async create(data: Pick<IGreeting, 'authorId' | 'authorName' | 'message' | 'eventTag'>): Promise<IGreeting> {
    await this.ensureConnected()
    const doc = await Greeting.create({
      id: nanoid(),
      authorId: data.authorId ?? null,
      authorName: data.authorName || 'Ẩn danh',
      message: data.message,
      eventTag: data.eventTag || '8-3',
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

  async findAll(opts: {
    page?: number
    limit?: number
    eventTag?: string
    approved?: boolean
  }): Promise<{ items: IGreeting[]; total: number }> {
    await this.ensureConnected()
    const { page = 1, limit = 20, eventTag, approved } = opts
    const query: Record<string, unknown> = { isDeleted: false }
    if (eventTag) query.eventTag = eventTag
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
