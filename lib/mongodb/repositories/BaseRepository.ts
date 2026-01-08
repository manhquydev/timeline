import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'
import { connectToDatabase } from '../connection'
import { nanoid } from 'nanoid'

/**
 * Pagination result interface
 */
export interface PaginatedResult<T> {
    data: T[]
    nextCursor: string | null
    hasMore: boolean
    total?: number
}

/**
 * Query options for find operations
 */
export interface FindOptions {
    select?: string[]
    lean?: boolean
    sort?: Record<string, 1 | -1>
    limit?: number
    skip?: number
}

/**
 * Cursor pagination options
 */
export interface CursorPaginationOptions {
    cursor?: string
    limit?: number
    sort?: Record<string, 1 | -1>
    select?: string[]
}

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
     * Find by ID with lean option (returns plain object)
     */
    async findByIdLean(id: string, select?: string[]): Promise<I | null> {
        await this.ensureConnection()
        let query = this.model.findOne({ id } as FilterQuery<T>)
        if (select?.length) {
            query = query.select(select.join(' '))
        }
        return await query.lean<I>()
    }

    /**
     * Find one by filter
     */
    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        await this.ensureConnection()
        return await this.model.findOne(filter)
    }

    /**
     * Find one with lean option
     */
    async findOneLean(filter: FilterQuery<T>, select?: string[]): Promise<I | null> {
        await this.ensureConnection()
        let query = this.model.findOne(filter)
        if (select?.length) {
            query = query.select(select.join(' '))
        }
        return await query.lean<I>()
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
     * Find many with lean option (returns plain objects)
     */
    async findLean(filter: FilterQuery<T> = {}, options: FindOptions = {}): Promise<I[]> {
        await this.ensureConnection()
        let query = this.model.find(filter)

        if (options.select?.length) {
            query = query.select(options.select.join(' '))
        }
        if (options.sort) {
            query = query.sort(options.sort)
        }
        if (options.limit) {
            query = query.limit(options.limit)
        }
        if (options.skip) {
            query = query.skip(options.skip)
        }

        return await query.lean<I[]>()
    }

    /**
     * Find with cursor-based pagination
     */
    async findPaginated(
        filter: FilterQuery<T> = {},
        options: CursorPaginationOptions = {}
    ): Promise<PaginatedResult<I>> {
        await this.ensureConnection()

        const { cursor, limit = 20, sort = { _id: -1 }, select } = options
        const actualLimit = Math.min(limit, 100)

        let paginatedFilter = { ...filter }
        if (cursor) {
            const sortField = Object.keys(sort)[0]
            const sortOrder = sort[sortField]
            const cursorOp = sortOrder === -1 ? '$lt' : '$gt'
            paginatedFilter = {
                ...paginatedFilter,
                [sortField]: { [cursorOp]: cursor }
            } as FilterQuery<T>
        }

        let query = this.model.find(paginatedFilter).sort(sort).limit(actualLimit + 1)

        if (select?.length) {
            query = query.select(select.join(' '))
        }

        const results = await query.lean<I[]>()
        const hasMore = results.length > actualLimit
        const data = hasMore ? results.slice(0, actualLimit) : results

        const lastItem = data[data.length - 1] as any
        const sortField = Object.keys(sort)[0]
        const nextCursor = hasMore && lastItem ? String(lastItem[sortField] || lastItem._id) : null

        return { data, nextCursor, hasMore }
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
