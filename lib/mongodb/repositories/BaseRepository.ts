import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'
import { connectToDatabase } from '../connection'
import { nanoid } from 'nanoid'

/**
 * Base Repository
 * Centralizes common database patterns and boilerplate
 */
export abstract class BaseRepository<T extends Document, I> {
    protected model: Model<T>

    constructor(model: Model<T>) {
        this.model = model
    }

    /**
     * Ensure database connection before operations
     */
    protected async ensureConnection() {
        await connectToDatabase()
    }

    /**
     * Create a new record
     */
    async create(data: Partial<I>): Promise<T> {
        await this.ensureConnection()
        const record = new this.model({
            id: nanoid(),
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
        })
        return await record.save()
    }

    /**
     * Find by custom ID (nanoid)
     */
    async findById(id: string): Promise<T | null> {
        await this.ensureConnection()
        return await this.model.findOne({ id } as FilterQuery<T>)
    }

    /**
     * Find one by filter
     */
    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        await this.ensureConnection()
        return await this.model.findOne(filter)
    }

    /**
     * Find many by filter
     */
    async find(filter: FilterQuery<T> = {}, sort: any = { created_at: -1 }, limit?: number): Promise<T[]> {
        await this.ensureConnection()
        let query = this.model.find(filter).sort(sort)
        if (limit) {
            query = query.limit(limit)
        }
        return await query
    }

    /**
     * Update by custom ID (nanoid)
     */
    async update(id: string, updateData: UpdateQuery<T>, options: QueryOptions = { new: true, runValidators: true }): Promise<T | null> {
        await this.ensureConnection()
        return await this.model.findOneAndUpdate(
            { id } as FilterQuery<T>,
            { $set: updateData },
            options
        )
    }

    /**
     * Delete by custom ID (nanoid)
     */
    async delete(id: string): Promise<boolean> {
        await this.ensureConnection()
        const result = await this.model.deleteOne({ id } as FilterQuery<T>)
        return result.deletedCount > 0
    }

    /**
     * Count documents
     */
    async count(filter: FilterQuery<T> = {}): Promise<number> {
        await this.ensureConnection()
        return await this.model.countDocuments(filter)
    }

    /**
     * Bulk update
     */
    async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>) {
        await this.ensureConnection()
        return await this.model.updateMany(filter, update)
    }
}
