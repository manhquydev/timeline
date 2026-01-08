import { z } from 'zod'

// Common ID schemas
export const idSchema = z.string().min(1, 'ID is required')
export const nanoidSchema = z.string().length(21, 'Invalid ID format')
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
})

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Date schemas
export const dateStringSchema = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
export const dateRangeSchema = z.object({
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
})

// Sort schemas
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc')
export const sortFieldSchema = z.string().min(1)

// Status schemas
export const postStatusSchema = z.enum(['pending', 'approved', 'rejected'])
export const eventStatusSchema = z.enum(['draft', 'open', 'closed', 'archived'])

// Common field schemas
export const emailSchema = z.string().email('Invalid email format')
export const urlSchema = z.string().url('Invalid URL format')
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')

// Text content schemas
export const shortTextSchema = z.string().min(1).max(255)
export const longTextSchema = z.string().min(1).max(5000)
export const wishTextSchema = z.string().max(500).optional().nullable()

// Sanitization helpers
export const sanitizedString = z.string().transform((val) =>
  val.replace(/<[^>]*>/g, '').trim()
)

// Type exports
export type Pagination = z.infer<typeof paginationSchema>
export type CursorPagination = z.infer<typeof cursorPaginationSchema>
export type PostStatus = z.infer<typeof postStatusSchema>
export type EventStatus = z.infer<typeof eventStatusSchema>
