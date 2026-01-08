import { z } from 'zod'
import { idSchema, eventStatusSchema, shortTextSchema, longTextSchema, urlSchema, cursorPaginationSchema } from './common'

// Create event schema
export const createEventSchema = z.object({
  title: shortTextSchema,
  description: longTextSchema.optional(),
  cover_url: urlSchema.optional().nullable(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  location: shortTextSchema.optional(),
  status: eventStatusSchema.default('draft'),
  allow_upload: z.boolean().default(true),
  is_public: z.boolean().default(true),
})

// Update event schema
export const updateEventSchema = z.object({
  eventId: idSchema,
  title: shortTextSchema.optional(),
  description: longTextSchema.optional(),
  cover_url: urlSchema.optional().nullable(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  location: shortTextSchema.optional(),
  status: eventStatusSchema.optional(),
  allow_upload: z.boolean().optional(),
  is_public: z.boolean().optional(),
})

// Delete event schema
export const deleteEventSchema = z.object({
  eventId: idSchema,
})

// Get event schema
export const getEventSchema = z.object({
  eventId: idSchema,
})

// List events schema
export const listEventsSchema = z.object({
  status: eventStatusSchema.optional(),
  isPublic: z.coerce.boolean().optional(),
}).merge(cursorPaginationSchema)

// Type exports
export type CreateEvent = z.infer<typeof createEventSchema>
export type UpdateEvent = z.infer<typeof updateEventSchema>
export type GetEvent = z.infer<typeof getEventSchema>
export type ListEvents = z.infer<typeof listEventsSchema>
